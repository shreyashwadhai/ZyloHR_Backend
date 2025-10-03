const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");
const errorHandler = require("../middlewares/errorHandler");
const fileValidation = require("../middlewares/fileValidation");
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    userDetails,
    updateProfile,
} = require("../controllers/user.controller");

const attendanceController = require("../controllers/attendance.controller");

const {
    getAllLeaves,
    createLeave,
    updateLeave,
    deleteLeave,
} = require("../controllers/leave.controllers");

const {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require("../controllers/announcement.controller");

const {
    createFeed,
    getAllFeeds,
    updateFeed,
    deleteFeed,
    getFeedByUserId,
    likeUnlikeFeed,
    addCommentOnFeed,
    deleteCommentOnFeed,
    updateCommentOnFeed,
} = require("../controllers/feed.controller");
const upload = require("../middlewares/upload");
const { getMessages, sendMessage, getConversation, markAsRead, getUnreadCount } = require("../controllers/messageCenter.controller");

const router = express.Router();

// Middleware of Checking authenticated User & it's Role
router.use(authMiddleware, errorHandler);

// User Management
router.get("/users", authorizeRole("admin", "manager"), getAllUsers);
router.post("/users", authorizeRole("admin", "manager"), createUser);
router.put("/users/:id", authorizeRole("admin", "employee", "manager"), updateUser);
router.delete("/users/:id", authorizeRole("admin", "manager"), deleteUser);
router.get("/users/userDetails/:id", authorizeRole("admin", "manager"), userDetails);

// Update User Profile
router.put("/users/profile/:id", authorizeRole("admin", "employee", "manager"), upload.single("media"), fileValidation, updateProfile);

// Attendance Management
// router.get("/all_attendance", getAllAttendance);
// // router.get('/attendance', getMyAttendance);
// router.post("/attendance", createAttendance);
// router.put("/attendance/:id", updateAttendance);
// router.delete("/attendance/:id", deleteAttendance);

// Punch In/Out Routes
router.post('/attendance/punch-in', authorizeRole("admin", "employee", "manager"), attendanceController.punchIn);
router.post('/attendance/punch-out', authorizeRole("admin", "employee", "manager"), attendanceController.punchOut);
// Attendance Data Routes
router.get('/attendance/today/:employeeId', authorizeRole("admin", "employee", "manager"), attendanceController.getTodayAttendance);
router.get('/attendance/records/:employeeId', authorizeRole("admin", "employee", "manager"), attendanceController.getAttendanceRecords);

// Message routes
router.get("/messages", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);
router.get("/messages/conversation/:userId", authMiddleware, getConversation);
router.put("/messages/read/:senderId", authMiddleware, markAsRead);
router.get("/messages/unread-count", authMiddleware, getUnreadCount);

// Leave Management
router.get("/leaves", authorizeRole("admin", "employee", "manager"), getAllLeaves);
router.post("/leave", authorizeRole("admin", "employee", "manager"), createLeave);
router.put("/leave/:id", authorizeRole("admin", "employee", "manager"), updateLeave);
router.delete("/leave/:id", authorizeRole("admin", "employee", "manager"), deleteLeave);

// Feed Management
router.get("/feeds", authorizeRole("admin", "employee", "manager"), getAllFeeds);
router.get("/feed/:id", authorizeRole("admin", "employee", "manager"), getFeedByUserId);
router.post("/feed", authorizeRole("admin", "employee", "manager"), upload.single("media"), fileValidation, createFeed);
router.put("/feed/update/:id", authorizeRole("admin", "employee", "manager"), fileValidation, updateFeed);
router.delete("/feed/:id", authorizeRole("admin", "employee", "manager"), deleteFeed);
// ----------------------
router.put("/feed/:id", authorizeRole("admin", "employee", "manager"), likeUnlikeFeed);
router.post("/feed/comment/:id", authorizeRole("admin", "employee", "manager"), addCommentOnFeed);
router.delete("/feed/comment/:feedId/:commentId", authorizeRole("admin", "employee", "manager"), deleteCommentOnFeed);
// router.put("/feed/comment/:feedId/:commentId",authorizeRole("admin", "employee", "manager"), updateCommentOnFeed);


// Announcements Management
router.get("/announcements", authorizeRole("admin", "employee", "manager"), getAllAnnouncements);
router.post("/announcement", authorizeRole("admin", "manager"), createAnnouncement);
router.delete("/announcement/:id", authorizeRole("admin", "manager"), deleteAnnouncement);


// Leave Management
module.exports = router;
