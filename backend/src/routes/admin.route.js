import { Router } from "express";
import { createSong, deleteSong, createAlumb, deleteAlbum, checkAdmin } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin)

router.get("/check", checkAdmin);

router.post('/songs', createSong); // use middleware to check authentication tobe admin
router.delete('/songs/:id', deleteSong);

router.post('/albums', createAlumb);
router.delete('/albums/:id', deleteAlbum);

export default router