const router = require("express").Router();
const employees = require("../../db/models/employee-model");
const { addEmployee, getEmployee, updateEmployee, deleteEmployee, fetchEmployees } = require("../../controllers/employee-controller")
const getAdmin = require("../../controllers/admin-controller").getAdmin;
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
        body('number')
            .notEmpty().withMessage('Number is required')
            .isLength({ min: 9 }).withMessage('Number must be at least 9 characters'),
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
                    const { name, email, password, number } = req.body;

                    let registeredEmployeeEmail = await employees.findOne({
                        _email: email,
                    });

                    if (registeredEmployeeEmail) {
                        return res.status(409).json({
                            id: 16,
                            statusCode: 409,
                            message: "Email already registered...",
                            password: process.env.CLIENT_PASSWORD,
                        });
                    } else {
                        let newEmployee = await addEmployee({
                            name: name,
                            email: email,
                            number: number,
                            password: password,
                        });

                        const payload = {
                            credentials: {
                                id: newEmployee._id,
                            },
                        };

                        var token = jwt.sign(payload, jwt__Key);

                        return res.status(201).json({
                            id: 13,
                            statusCode: 201,
                            message: "Employee registered succesfully...",
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
                    "Some error occured in the auth-employees register route: ",
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
                    let employee = await employees.findOne({
                        _email: req.header("email"),
                    });

                    if (employee) {
                        let password = decrypter(employee._password);
                        if (req.header("password") === password) {
                            const payload = {
                                credentials: {
                                    id: employee._id,
                                },
                            };

                            var token = jwt.sign(payload, jwt__Key);

                            return res.status(201).json({
                                id: 13,
                                statusCode: 201,
                                message: "Employee authenticated succesfully...",
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
                    "Some error occured in the auth-employees login route: ",
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
            const { employee, employeeFetchingError, message } = await getEmployee({
                id: req.credentials.id,
            });

            if (employeeFetchingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Employee data fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: employee,
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
        console.log("Some error occured in the auth-employees info route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.get("/fetch", [
    header('employeeId').optional().notEmpty().withMessage('Employee ID is required if fetching single employee'),
],verifyUser, async (req, res) => {
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
            } else if (requestType === 'employee') {
                const { employeeFetchingError, message } = await getEmployee({
                    id: req.credentials.id,
                });

                if (employeeFetchingError) {
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
                const { employeesList, employeesFetchingError, message } = await fetchEmployees();

                if (employeesFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                } else {
                    return res.status(200).json({
                        id: 12,
                        statusCode: 200,
                        message: "Employees fetched successfully...",
                        password: process.env.CLIENT_PASSWORD,
                        data: employeesList,
                    });
                }

            } else if (fetchType === 'single') {

                const { employee, employeeFetchingError, message } = await getEmployee({
                    id: req.header("employeeId") || req.credentials.id,
                });

                if (employeeFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                } else {
                    return res.status(200).json({
                        id: 12,
                        statusCode: 200,
                        message: "Employee data fetched successfully...",
                        password: process.env.CLIENT_PASSWORD,
                        data: employee,
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
    body('employeeUpdates').isObject().withMessage('Employee updates must be an object'),
    header('employeeId').optional().notEmpty().withMessage('Employee ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { employeeUpdates } = req.body;
            const requestType = req.header("requestType");

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
            } else if (requestType === 'employee') {
                const { employeeFetchingError, message } = await getEmployee({
                    id: req.credentials.id,
                });

                if (employeeFetchingError) {
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

            const { employee, employeeUpdatingError, message } = await updateEmployee({
                id: req.header("employeeId") || req.credentials.id,
                employeeUpdates: employeeUpdates,
            });

            if (employeeUpdatingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Employee data updated successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: employee,
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

router.delete("/delete", [
    header('employeeId').optional().notEmpty().withMessage('Employee ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const requestType = req.header("requestType");

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
            } else if (requestType === 'employee') {
                const { employeeFetchingError, message } = await getEmployee({
                    id: req.credentials.id,
                });

                if (employeeFetchingError) {
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
            const { employee, employeeDeletingError, message } = await deleteEmployee({
                id: req.header("employeeId") || req.credentials.id,
            });

            if (employeeDeletingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Employee deleted successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: employee,
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

module.exports = router;

