import Habit from "../models/habit.model";
import { logInfo, logError } from "../utils/logger";

// Custom error classes
export class HabitNotFoundError extends Error {
  constructor(message: string = "Hábito não encontrado") {
    super(message);
    this.name = "HabitNotFoundError";
  }
}

export class UnauthorizedAccessError extends Error {
  constructor(message: string = "Acesso não autorizado") {
    super(message);
    this.name = "UnauthorizedAccessError";
  }
}

export class ValidationError extends Error {
  constructor(message: string = "Dados inválidos") {
    super(message);
    this.name = "ValidationError";
  }
}

export class ForbiddenAccessError extends Error {
  constructor(message: string = "Você não tem permissão para acessar este recurso") {
    super(message);
    this.name = "ForbiddenAccessError";
  }
}

/**
 * Create a new habit for a user
 */
export const createHabit = async (userId: string, data: {
  name: string;
  description?: string;
  frequency?: "Diário" | "Semanal" | "Quinzenal" | "Mensal";
  isActive?: boolean;
}) => {
  try {
    logInfo("Creating habit", { userId, name: data.name });

    // Validate input
    if (!data.name || data.name.trim().length < 2) {
      throw new ValidationError("Nome deve ter pelo menos 2 caracteres");
    }

    // Create habit
    const habit = await Habit.create({
      ...data,
      userId
    });

    logInfo("Habit created successfully", { habitId: habit._id });

    return {
      id: habit._id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      isActive: habit.isActive,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      message: "Hábito criado com sucesso"
    };
  } catch (error: any) {
    logError("Error creating habit", error);
    
    if (error.name === "ValidationError") {
      throw error;
    }
    
    if (error.name === "MongooseError" && error.message) {
      throw new ValidationError(error.message);
    }
    
    throw new Error("Erro ao criar hábito");
  }
};

/**
 * Get all habits for a user with optional filtering
 */
export const getHabits = async (userId: string, filters?: any) => {
  try {
    logInfo("Fetching habits", { userId, filters });

    // Build query
    const query: any = { userId };

    // Apply filters if provided
    if (filters) {
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true';
      }
      if (filters.frequency) {
        query.frequency = filters.frequency;
      }
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }
    }

    const habits = await Habit.find(query).sort({ createdAt: -1 });

    logInfo("Habits fetched successfully", { count: habits.length });

    return habits.map(habit => ({
      id: habit._id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      isActive: habit.isActive,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt
    }));
  } catch (error) {
    logError("Error fetching habits", error);
    throw new Error("Erro ao buscar hábitos");
  }
};

/**
 * Get a single habit by ID (ensure it belongs to the user)
 */
export const getHabitById = async (userId: string, habitId: string) => {
  try {
    logInfo("Fetching habit by ID", { userId, habitId });

    const habit = await Habit.findById(habitId);

    if (!habit) {
      logError("Habit not found", { habitId });
      throw new HabitNotFoundError();
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== userId) {
      logError("Unauthorized access to habit", { userId, habitId, habitUserId: habit.userId });
      throw new ForbiddenAccessError();
    }

    logInfo("Habit fetched successfully");

    return {
      id: habit._id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      isActive: habit.isActive,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt
    };
  } catch (error: any) {
    if (error.name === "HabitNotFoundError" || error.name === "ForbiddenAccessError") {
      throw error;
    }
    logError("Error fetching habit by ID", error);
    throw new Error("Erro ao buscar hábito");
  }
};

/**
 * Update a habit completely (PUT)
 */
export const updateHabit = async (userId: string, habitId: string, data: {
  name: string;
  description?: string;
  frequency?: "Diário" | "Semanal" | "Quinzenal" | "Mensal";
  isActive?: boolean;
}) => {
  try {
    logInfo("Updating habit (PUT)", { userId, habitId });

    // Validate input
    if (!data.name || data.name.trim().length < 2) {
      throw new ValidationError("Nome deve ter pelo menos 2 caracteres");
    }

    const habit = await Habit.findById(habitId);

    if (!habit) {
      logError("Habit not found", { habitId });
      throw new HabitNotFoundError();
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== userId) {
      logError("Unauthorized access to habit (PUT)", { userId, habitId, habitUserId: habit.userId });
      throw new ForbiddenAccessError();
    }

    // Update all fields
    habit.name = data.name;
    habit.description = data.description !== undefined ? data.description : habit.description;
    habit.frequency = data.frequency !== undefined ? data.frequency : habit.frequency;
    habit.isActive = data.isActive !== undefined ? data.isActive : habit.isActive;

    await habit.save();

    logInfo("Habit updated successfully (PUT)");

    return {
      id: habit._id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      isActive: habit.isActive,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      message: "Hábito atualizado com sucesso"
    };
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "HabitNotFoundError" || error.name === "ForbiddenAccessError") {
      throw error;
    }
    logError("Error updating habit (PUT)", error);
    throw new Error("Erro ao atualizar hábito");
  }
};

/**
 * Partially update a habit (PATCH)
 */
export const patchHabit = async (userId: string, habitId: string, data: {
  name?: string;
  description?: string;
  frequency?: "Diário" | "Semanal" | "Quinzenal" | "Mensal";
  isActive?: boolean;
}) => {
  try {
    logInfo("Updating habit (PATCH)", { userId, habitId });

    // Validate input if name is being updated
    if (data.name !== undefined && data.name.trim().length < 2) {
      throw new ValidationError("Nome deve ter pelo menos 2 caracteres");
    }

    const habit = await Habit.findById(habitId);

    if (!habit) {
      logError("Habit not found", { habitId });
      throw new HabitNotFoundError();
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== userId) {
      logError("Unauthorized access to habit (PATCH)", { userId, habitId, habitUserId: habit.userId });
      throw new ForbiddenAccessError();
    }

    // Update only provided fields
    if (data.name !== undefined) habit.name = data.name;
    if (data.description !== undefined) habit.description = data.description;
    if (data.frequency !== undefined) habit.frequency = data.frequency;
    if (data.isActive !== undefined) habit.isActive = data.isActive;

    await habit.save();

    logInfo("Habit updated successfully (PATCH)");

    return {
      id: habit._id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      isActive: habit.isActive,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      message: "Hábito atualizado com sucesso"
    };
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "HabitNotFoundError" || error.name === "ForbiddenAccessError") {
      throw error;
    }
    logError("Error updating habit (PATCH)", error);
    throw new Error("Erro ao atualizar hábito");
  }
};

/**
 * Delete a habit
 */
export const deleteHabit = async (userId: string, habitId: string) => {
  try {
    logInfo("Deleting habit", { userId, habitId });

    const habit = await Habit.findById(habitId);

    if (!habit) {
      logError("Habit not found", { habitId });
      throw new HabitNotFoundError();
    }

    // Check if habit belongs to user
    if (habit.userId.toString() !== userId) {
      logError("Unauthorized access to habit (DELETE)", { userId, habitId, habitUserId: habit.userId });
      throw new ForbiddenAccessError();
    }

    await Habit.findByIdAndDelete(habitId);

    logInfo("Habit deleted successfully");

    return {
      message: "Hábito deletado com sucesso",
      id: habit._id
    };
  } catch (error: any) {
    if (error.name === "HabitNotFoundError" || error.name === "ForbiddenAccessError") {
      throw error;
    }
    logError("Error deleting habit", error);
    throw new Error("Erro ao deletar hábito");
  }
};

