/**
 * error-marks - 报错标记路由
 *
 * 职责：
 * - 提供点位报错标记的 CRUD API
 * - GET    /api/error-marks?user_id=xxx    获取用户的所有报错标记
 * - PUT    /api/error-marks                创建/更新报错标记 (upsert)
 * - DELETE /api/error-marks/:lineup_id     删除报错标记
 */

import { Router } from 'express';
import db from '../db.js';

const router = Router();

/**
 * GET /api/error-marks?user_id=xxx
 * 获取指定用户的所有报错标记
 */
router.get('/', (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        const marks = db.prepare(
            'SELECT lineup_id, error_type FROM error_marks WHERE user_id = ?'
        ).all(user_id);
        res.json(marks);
    } catch (error) {
        console.error('获取报错标记失败:', error);
        res.status(500).json({ error: '获取报错标记失败' });
    }
});

/**
 * PUT /api/error-marks
 * 创建或更新报错标记 (upsert)
 * Body: { user_id, lineup_id, error_type }
 */
router.put('/', (req, res) => {
    const { user_id, lineup_id, error_type } = req.body;
    if (!user_id || !lineup_id || !error_type) {
        return res.status(400).json({ error: 'user_id, lineup_id, error_type are required' });
    }

    try {
        db.prepare(`
            INSERT INTO error_marks (user_id, lineup_id, error_type)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, lineup_id) DO UPDATE SET
                error_type = excluded.error_type,
                created_at = datetime('now')
        `).run(user_id, lineup_id, error_type);

        res.json({ success: true });
    } catch (error) {
        console.error('保存报错标记失败:', error);
        res.status(500).json({ error: '保存报错标记失败' });
    }
});

/**
 * DELETE /api/error-marks/:lineup_id?user_id=xxx
 * 删除指定点位的报错标记
 */
router.delete('/:lineup_id', (req, res) => {
    const { lineup_id } = req.params;
    const { user_id } = req.query;
    if (!user_id || !lineup_id) {
        return res.status(400).json({ error: 'user_id and lineup_id are required' });
    }

    try {
        db.prepare(
            'DELETE FROM error_marks WHERE user_id = ? AND lineup_id = ?'
        ).run(user_id, lineup_id);

        res.json({ success: true });
    } catch (error) {
        console.error('删除报错标记失败:', error);
        res.status(500).json({ error: '删除报错标记失败' });
    }
});

export default router;
