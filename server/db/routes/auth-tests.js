const router = require("express").Router();
const tests = require("../../db/models/test-model");
const { addTest, deleteTest, fetchTests, getTest, updateTest } = require("../../controllers/test-controller");
const getAdmin = require("../../controllers/admin-controller").getAdmin;
const getEmployee = require("../../controllers/employee-controller").getEmployee;
const { body, header, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const verifyUser = require("../middlewares/verify-jwt-token");
const dotenv = require("dotenv");

dotenv.config();
const jwt__Key = process.env.YGG_TOKEN;

router.post(
    "/register",
    [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
        body('code')
            .notEmpty().withMessage('Code is required')
            .isLength({ min: 3 }).withMessage('Code must be at least 3 characters'),
        body('description')
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 3 }).withMessage('Description must be at least 3 characters'),
        body('category')
            .notEmpty().withMessage('Category is required')
            .isLength({ min: 3 }).withMessage('Category must be at least 3 characters'),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isNumeric().withMessage('Price must be a number'),
        body('units')
            .notEmpty().withMessage('Units are required')
            .isLength({ min: 3 }).withMessage('Units must be at least 3 characters'),
        body('normalRange')
            .notEmpty().withMessage('Normal range is required')
            .isLength({ min: 3 }).withMessage('Normal range must be at least 3 characters'),
        body('isSubtests')
            .isBoolean().withMessage('IsSubtests must be a boolean'),
        body('subtests')
            .optional()
            .isArray().withMessage('Subtests must be an array')
    ], verifyUser,
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
                    const { name, code, description, category, price, units, normalRange, isSubtests, subtests } = req.body;
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

                    let registeredTestCode = await tests.findOne({
                        _code: code,
                    });

                    if (registeredTestCode) {
                        return res.status(409).json({
                            id: 16,
                            statusCode: 409,
                            message: "Test already registered...",
                            password: process.env.CLIENT_PASSWORD,
                        });
                    } else {
                        let newTest = await addTest({
                            name: name,
                            code: code,
                            description: description,
                            category: category,
                            price: price,
                            units: units,
                            normalRange: normalRange,
                            isSubtests: isSubtests,
                            subtests: subtests,
                        });

                        const payload = {
                            credentials: {
                                id: newTest._id,
                            },
                        };

                        var token = jwt.sign(payload, jwt__Key);

                        return res.status(201).json({
                            id: 13,
                            statusCode: 201,
                            message: "Test registered succesfully...",
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
                    "Some error occured in the auth-tests register route: ",
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

router.get("/fetch", [
    header('testId').notEmpty().withMessage('Test ID is required'),
], async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const fetchType = req.header("fetchType");

            if (fetchType === 'all') {
                const { testsList, testsFetchingError, message } = await fetchTests();
                if (testsFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Tests fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: testsList,
                });
            } else if (fetchType === 'single') {
                const { test, testFetchingError, message } = await getTest({
                    id: req.header("testId"),
                });

                if (testFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Test fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: test,
                });
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
        console.log("Some error occured in the auth-tests fetch route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.put("/update", [
    body('testUpdates').isObject().withMessage('Test updates must be an object'),
    header('testId').notEmpty().withMessage('Test ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { testUpdates } = req.body;
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

            const { test, testUpdatingError, message } = await updateTest({
                id: req.header("testId"),
                testUpdates: testUpdates,
            });

            if (testUpdatingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Test data updated successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: test,
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
        console.log("Some error occured in the auth-tests update route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.delete("/delete", [
    header('testId').notEmpty().withMessage('Doctor ID is required'),
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

            const { test, testDeletingError, message } = await deleteTest({
                id: req.header("testId"),
            });

            if (testDeletingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Test deleted successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: test,
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
        console.log("Some error occured in the auth-tests delete route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

module.exports = router;
