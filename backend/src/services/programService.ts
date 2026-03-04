import { AppDataSource } from '../config/database';
import { Program } from '../entities/Program';
import { Workout } from '../entities/Workout';
import { Exercise } from '../entities/Exercise';

const getProgramRepo = () => AppDataSource.getRepository(Program);
const getWorkoutRepo = () => AppDataSource.getRepository(Workout);
const getExerciseRepo = () => AppDataSource.getRepository(Exercise);

export interface CreateProgramInput {
    name: string;
    description?: string;
    duration_weeks?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    equipment_needed?: string[];
    price_monthly?: number;
    price_one_time?: number;
    thumbnail_url?: string;
}

export interface CreateWorkoutInput {
    week_number?: number;
    day_number?: number;
    name?: string;
    description?: string;
    duration_minutes?: number;
    exercises?: CreateExerciseInput[];
}

export interface CreateExerciseInput {
    exercise_name?: string;
    sets?: number;
    reps_min?: number;
    reps_max?: number;
    weight_kg?: number;
    rest_seconds?: number;
    form_cues?: string;
    video_url?: string;
    order_number?: number;
}

class ProgramService {
    async createProgram(trainerId: string, input: CreateProgramInput) {
        const program = getProgramRepo().create({
            trainer_id: trainerId,
            ...input,
        });
        return getProgramRepo().save(program);
    }

    async updateProgram(trainerId: string, programId: string, input: Partial<CreateProgramInput>) {
        const program = await getProgramRepo().findOneBy({ id: programId, trainer_id: trainerId });
        if (!program) throw new Error('Program not found or unauthorized');
        Object.assign(program, input);
        return getProgramRepo().save(program);
    }

    async publishProgram(trainerId: string, programId: string) {
        const program = await getProgramRepo().findOneBy({ id: programId, trainer_id: trainerId });
        if (!program) throw new Error('Program not found or unauthorized');
        program.is_published = true;
        return getProgramRepo().save(program);
    }

    async getProgramsByTrainer(trainerId: string, onlyPublished = false) {
        const where: any = { trainer_id: trainerId };
        if (onlyPublished) where.is_published = true;
        return getProgramRepo().find({ where, order: { created_at: 'DESC' } });
    }

    async getProgramById(programId: string) {
        const program = await getProgramRepo()
            .createQueryBuilder('program')
            .leftJoinAndSelect('program.workouts', 'workout')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .where('program.id = :id', { id: programId })
            .orderBy('workout.week_number', 'ASC')
            .addOrderBy('workout.day_number', 'ASC')
            .addOrderBy('exercise.order_number', 'ASC')
            .getOne();
        if (!program) throw new Error('Program not found');
        return program;
    }

    async addWorkoutToProgram(trainerId: string, programId: string, input: CreateWorkoutInput) {
        const program = await getProgramRepo().findOneBy({ id: programId, trainer_id: trainerId });
        if (!program) throw new Error('Program not found or unauthorized');

        const { exercises: exercisesInput, ...workoutData } = input;
        const workout = getWorkoutRepo().create({ program_id: programId, ...workoutData });
        const savedWorkout = await getWorkoutRepo().save(workout);

        if (exercisesInput && exercisesInput.length > 0) {
            const exercises = exercisesInput.map(ex =>
                getExerciseRepo().create({ workout_id: savedWorkout.id, ...ex })
            );
            savedWorkout.exercises = await getExerciseRepo().save(exercises);
        }

        return savedWorkout;
    }

    async deleteProgram(trainerId: string, programId: string) {
        const program = await getProgramRepo().findOneBy({ id: programId, trainer_id: trainerId });
        if (!program) throw new Error('Program not found or unauthorized');
        await getProgramRepo().remove(program);
        return { success: true };
    }
}

export const programService = new ProgramService();
