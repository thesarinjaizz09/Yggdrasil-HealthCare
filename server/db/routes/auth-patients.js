const router = require("express").Router();
const patients = require("../../db/models/patient-model");
const { addPatient, deletePatient, fetchPatients, getPatient, updatePatient } = require("../../controllers/patient-controller");
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
        body('dateOfBirth')
            .notEmpty().withMessage('Date of Birth is required')
            .isDate().withMessage('Date of Birth must be a valid date'),
        body('gender')
            .notEmpty().withMessage('Gender is required')
            .isLength({ min: 3 }).withMessage('Gender must be at least 3 characters'),
        body('number')
            .notEmpty().withMessage('Number is required')
            .isLength({ min: 9 }).withMessage('Number must be at least 9 characters'),
        body('address')
            .notEmpty().withMessage('Address is required')
            .isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
        body('referDoctor')
            .notEmpty().withMessage('Refer Doctor is required')
            .isLength({ min: 3 }).withMessage('Refer Doctor must be at least 3 characters'),
        body('prescribedTests')
            .notEmpty().withMessage('Prescribed Tests are required')
            .isArray().withMessage('Prescribed Tests must be an array'),
        body('totalPrice')
            .notEmpty().withMessage('Total Price is required')
            .isNumeric().withMessage('Total Price must be a number'),
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
                    const { name, dateOfBirth, gender, number, address, referDoctor, prescribedTests, totalPrice } = req.body;
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

                    let { newPatient, patientAddingError, message } = await addPatient({
                        name: name,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        number: number,
                        address: address,
                        referDoctor: referDoctor,
                        prescribedTests: prescribedTests,
                        totalPrice: totalPrice,
                    });
                    if (patientAddingError) {
                        return res.status(400).json({
                            id: 18,
                            statusCode: 400,
                            message: message,
                        });
                    }

                    const payload = {
                        credentials: {
                            id: newPatient._id,
                        },
                    };

                    var token = jwt.sign(payload, jwt__Key);

                    return res.status(201).json({
                        id: 13,
                        statusCode: 201,
                        message: "Patient registered succesfully...",
                        password: process.env.CLIENT_PASSWORD,
                        credentials: {
                            authToken: token,
                        },
                    });

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
                    "Some error occured in the auth-patients register route: ",
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
        header("number", "Please provide valid number...").isMobilePhone("any", { strictMode: false }),
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
                    let patient = await patients.findOne({
                        _number: req.header("number"),
                    });

                    if (patient) {
                        let password = patient._dateOfBirth;
                        if (req.header("password") === password) {
                            const payload = {
                                credentials: {
                                    id: patient._id,
                                },
                            };

                            var token = jwt.sign(payload, jwt__Key);

                            return res.status(201).json({
                                id: 13,
                                statusCode: 201,
                                message: "Patient authenticated succesfully...",
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
                    "Some error occured in the auth-patients login route: ",
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
            const { patient, patientFetchingError, message } = await getPatient({
                id: req.credentials.id,
            });

            if (patientFetchingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Patient data fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: patient,
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
        console.log("Some error occured in the auth-patients info route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.get("/fetch", [
    header('patientId').notEmpty().withMessage('Patient ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const fetchType = req.header("fetchType");
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

            if (fetchType === 'all') {
                const { patientsList, patientsFetchingError, message } = await fetchPatients();
                if (patientsFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Patients fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: patientsList,
                });
            } else if (fetchType === 'single') {
                const { patient, patientFetchingError, message } = await getPatient({
                    id: req.header("patientId") || req.credentials.id,
                });

                if (patientFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Patient fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: patient,
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
        console.log("Some error occured in the auth-patients fetch route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.put("/update", [
    body('patientUpdates').isObject().withMessage('Patient updates must be an object'),
    header('patientId').notEmpty().withMessage('Patient ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { patientUpdates } = req.body;
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
            } else if (requestType === 'patient') {
                if (req.header("patientId") !== req.credentials.id) {
                    return res.status(403).json({
                        id: 20,
                        statusCode: 403,
                        message: "Access unauthorized...",
                    });
                }
            }
            else {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: 'Invalid request type...',
                });
            }

            const { patient, patientUpdatingError, message } = await updatePatient({
                id: req.header("patientId") || req.credentials.id,
                patientUpdates: patientUpdates,
            });

            if (patientUpdatingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Patient data updated successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: patient,
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
        console.log("Some error occured in the auth-patients update route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.delete("/delete", [
    header('patientId').notEmpty().withMessage('Patient ID is required'),
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
            } else if (requestType === 'patient') {
                if (req.header("patientId") !== req.credentials.id) {
                    return res.status(403).json({
                        id: 20,
                        statusCode: 403,
                        message: "Access unauthorized...",
                    });
                }
            } else {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: 'Invalid request type...',
                });
            }

            const { patient, patientDeletingError, message } = await deletePatient({
                id: req.header("patientId") || req.credentials.id,
            });

            if (patientDeletingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Patient deleted successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: patient,
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
        console.log("Some error occured in the auth-patients delete route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

module.exports = router;
