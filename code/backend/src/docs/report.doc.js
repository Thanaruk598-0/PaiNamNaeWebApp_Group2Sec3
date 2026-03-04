/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Incident report endpoints for users and admins
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new incident report (User)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [incidentType, title, description]
 *             properties:
 *               incidentType:
 *                 type: string
 *                 enum: [DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: MEDIUM
 *               title:
 *                 type: string
 *                 example: "พบพฤติกรรมไม่เหมาะสม"
 *               description:
 *                 type: string
 *                 example: "คนขับขับรถเร็วเกินไปในเขตชุมชน"
 *               location:
 *                 type: string
 *                 description: JSON string with lat, lng, address (optional)
 *                 example: '{"lat":13.7563,"lng":100.5018,"address":"Bangkok"}'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional incident image (max 5MB)
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reports/me:
 *   get:
 *     summary: Get my reports (User)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reports/admin:
 *   get:
 *     summary: Get all reports (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by title, description, or user name/email
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED] }
 *       - in: query
 *         name: incidentType
 *         schema: { type: string, enum: [DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, status, incidentType, priority] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Admin report list retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/reports/admin/{id}:
 *   get:
 *     summary: Get report by ID (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       404:
 *         description: Report not found
 */

/**
 * @swagger
 * /api/reports/admin/{id}:
 *   put:
 *     summary: Update report status (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
 *               adminNote:
 *                 type: string
 *                 example: "กำลังตรวจสอบข้อมูลเพิ่มเติม"
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 */

/**
 * @swagger
 * /api/reports/admin/{id}:
 *   delete:
 *     summary: Delete report (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
