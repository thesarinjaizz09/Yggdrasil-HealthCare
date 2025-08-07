const router = require("express").Router();
const admins = require("../../db/models/admin-model");
const { addAdmin, getAdmin, fetchAdmins, updateAdmin, deleteAdmin } = require("../../controllers/admin-controller");
const { body, header, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const verifyUser = require("../middlewares/verify-jwt-token");
const decrypter = require("../../utils/decryption/decrypter");
const dotenv = require("dotenv");

dotenv.config();
const jwt__Key = process.env.YGG_TOKEN;

router.post(
    "/register",
    [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(411).json({
                id: 2,
                statusCode: 411,
                message: "Please provide valid credentials...",
                errors: errors.array(),
                password: process.env.CLIENT_PASSWORD,
            });
        } else if (errors.isEmpty()) {
            try {
                if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
                    const { name, email, password } = req.body;

                    let registeredAdminEmail = await admins.findOne({
                        _email: email,
                    });

                    if (registeredAdminEmail) {
                        return res.status(409).json({
                            id: 16,
                            statusCode: 409,
                            message: "Email already registered...",
                            password: process.env.CLIENT_PASSWORD,
                        });
                    } else {
                        let newAdmin = await addAdmin({
                            name: name,
                            email: email,
                            password: password,
                        });

                        const payload = {
                            credentials: {
                                id: newAdmin._id,
                            },
                        };

                        var token = jwt.sign(payload, jwt__Key);

                        return res.status(201).json({
                            id: 13,
                            statusCode: 201,
                            message: "Admin registered succesfully...",
                            password: process.env.CLIENT_PASSWORD,
                            credentials: {
                                authToken: token,
                            },
                        });
                    }
                } else {
                    return res.status(400).json({
                        id: 20,
                        statusCode: 400,
                        message: "Access denied...",
                        password: process.env.CLIENT_PASSWORD,
                    });
                }
            } catch (error) {
                console.log(
                    "Some error occured in the auth-admins register route: ",
                    error
                );
                return res.status(500).json({
                    id: 20,
                    statusCode: 500,
                    message: "Internal server error...",
                    password: process.env.CLIENT_PASSWORD,
                });
            }
        }
    }
);

router.get(
    "/login",
    [
        header("email", "Please provide valid email...").isEmail(),
        header("password", "Please provide valid password...").isLength({
            min: 8,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(411).json({
                id: 2,
                statusCode: 411,
                message: "Please provide valid credentials...",
                errors: errors.array(),
            });
        } else if (errors.isEmpty()) {
            try {
                if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
                    let admin = await admins.findOne({
                        _email: req.header("email"),
                    });

                    if (admin) {
                        let password = decrypter(admin._password);
                        if (req.header("password") === password) {
                            const payload = {
                                credentials: {
                                    id: admin._id,
                                },
                            };

                            var token = jwt.sign(payload, jwt__Key);

                            return res.status(201).json({
                                id: 13,
                                statusCode: 201,
                                message: "Admin authenticated succesfully...",
                                password: process.env.CLIENT_PASSWORD,
                                credentials: {
                                    authToken: token,
                                },
                            });
                        } else {
                            return res.status(400).json({
                                id: 14,
                                statusCode: 400,
                                message: "Wrong credentials entered...",
                            });
                        }
                    } else {
                        return res.status(400).json({
                            id: 14,
                            statusCode: 400,
                            message: "Wrong credentials entered...",
                        });
                    }
                } else {
                    return res.status(400).json({
                        id: 20,
                        statusCode: 400,
                        message: "Access denied...",
                    });
                }
            } catch (error) {
                console.log(
                    "Some error occured in the auth-admins login route: ",
                    error
                );
                return res.status(500).json({
                    id: 20,
                    statusCode: 500,
                    message: "Internal server error...",
                });
            }
        }
    }
);

router.get("/info", verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { admin, adminFetchingError, message } = await getAdmin({
                id: req.credentials.id,
            });

            if (adminFetchingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Admin data fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: admin,
                });
            }
        } else {
            return res.status(400).json({
                id: 20,
                statusCode: 403,
                message: "Access denied...",
            });
        }
    } catch (error) {
        console.log("Some error occured in the auth-admins info route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.get("/fetch", [
    header('adminId').optional().notEmpty().withMessage('Admin ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const requestType = req.header("requestType");
            const fetchType = req.header("fetchType");

            if (requestType === 'admin') {
                const { adminFetchingError, message } = await getAdmin({
                    id: req.credentials.id,
                });

                if (adminFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
            } else {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: 'Invalid request type...',
                });
            }

            if (fetchType === 'all') {
                const { adminsList, adminsFetchingError, message } = await fetchAdmins();

                if (adminsFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                } else {
                    return res.status(200).json({
                        id: 12,
                        statusCode: 200,
                        message: "Admins fetched successfully...",
                        password: process.env.CLIENT_PASSWORD,
                        data: adminsList,
                    });
                }
            } else if (fetchType === 'single') {
                const { admin, adminFetchingError, message } = await getAdmin({
                    id: req.header("adminId") || req.credentials.id,
                });

                if (adminFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                } else {
                    return res.status(200).json({
                        id: 12,
                        statusCode: 200,
                        message: "Admin data fetched successfully...",
                        password: process.env.CLIENT_PASSWORD,
                        data: admin,
                    });
                }
            } else {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: 'Invalid fetch type...',
                });
            }
        } else {
            return res.status(400).json({
                id: 20,
                statusCode: 403,
                message: "Access denied...",
            });
        }
    } catch (error) {
        console.log("Some error occured in the auth-employees employee route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.put("/update", [
    body('adminUpdates').isObject().withMessage('Admin updates must be an object'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { adminUpdates } = req.body;
            const { admin, adminUpdatingError, message } = await updateAdmin({
                id: req.credentials.id,
                adminUpdates: adminUpdates,
            });

            if (adminUpdatingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Admin data updated successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: admin,
                });
            }
        } else {
            return res.status(400).json({
                id: 20,
                statusCode: 403,
                message: "Access denied...",
            });
        }
    } catch (error) {
        console.log("Some error occured in the auth-admins update route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.delete("/delete", verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { admin, adminDeletingError, message } = await deleteAdmin({
                id: req.credentials.id,
            });

            if (adminDeletingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Admin deleted successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: admin,
                });
            }
        } else {
            return res.status(400).json({
                id: 20,
                statusCode: 403,
                message: "Access denied...",
            });
        }
    } catch (error) {
        console.log("Some error occured in the auth-admins delete route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

module.exports = router;

