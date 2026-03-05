import { Request, Response } from 'express';
import { programService } from '../services/programService';

export const createProgram = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const program = await programService.createProgram(trainerId, req.body);
        res.status(201).json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateProgram = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const { id } = req.params;
        const program = await programService.updateProgram(trainerId, String(id), req.body);
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const publishProgram = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const { id } = req.params;
        const program = await programService.publishProgram(trainerId, String(id));
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllPrograms = async (req: Request, res: Response) => {
    try {
        const programs = await programService.getAllPrograms(true);
        res.json({ success: true, programs });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getProgramById = async (req: Request, res: Response) => {
    try {
        const program = await programService.getProgramById(String(req.params.id));
        res.json({ success: true, program });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

export const getTrainerPrograms = async (req: Request, res: Response) => {
    try {
        const { trainerId } = req.params;
        const trainerIdStr = String(trainerId);
        const isPublic = !req.user || req.user.user_id !== trainerIdStr;
        const programs = await programService.getProgramsByTrainer(trainerIdStr, isPublic);
        res.json({ success: true, programs });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const addWorkout = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const { id } = req.params;
        const workout = await programService.addWorkoutToProgram(trainerId, String(id), req.body);
        res.status(201).json({ success: true, workout });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteProgram = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const { id } = req.params;
        await programService.deleteProgram(trainerId, String(id));
        res.json({ success: true, message: 'Program deleted' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
