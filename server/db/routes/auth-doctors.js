const router = require("express").Router();
const doctors = require("../../db/models/doctor-model");
const { addDoctor, deleteDoctor, fetchDoctors, getDoctor, updateDoctor } = require("../../controllers/doctor-controller");
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
        body('degree')
            .notEmpty().withMessage('Degree is required')
            .isLength({ min: 3 }).withMessage('Degree must be at least 3 characters'),
        body('signature')
            .notEmpty().withMessage('Signature is required')
            .isLength({ min: 3 }).withMessage('Signature must be at least 3 characters'),
        body('number')
            .notEmpty().withMessage('Number is required')
            .isLength({ min: 9 }).withMessage('Number must be at least 10 characters'),
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
                    const { name, number, degree, signature } = req.body;

                    let registeredDoctorNumber = await doctors.findOne({
                        _number: number,
                    });

                    if (registeredDoctorNumber) {
                        return res.status(409).json({
                            id: 16,
                            statusCode: 409,
                            message: "Number already registered...",
                            password: process.env.CLIENT_PASSWORD,
                        });
                    } else {
                        let newDoctor = await addDoctor({
                            name: name,
                            degree: degree,
                            signature: signature,
                            number: number,
                        });

                        const payload = {
                            credentials: {
                                id: newDoctor._id,
                            },
                        };

                        var token = jwt.sign(payload, jwt__Key);

                        return res.status(201).json({
                            id: 13,
                            statusCode: 201,
                            message: "Doctor registered succesfully...",
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
                    "Some error occured in the auth-doctors register route: ",
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

router.get("/fetch",[
    header('doctorId').notEmpty().withMessage('Doctor ID is required'),
], async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const fetchType = req.header("fetchType");

            if (fetchType === 'all') {
                const { doctorsList, doctorsFetchingError, message } = await fetchDoctors();
                if (doctorsFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Doctors fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: doctorsList,
                });
            } else if (fetchType === 'single') {
                const { doctor, doctorFetchingError, message } = await getDoctor({
                    id: req.header("doctorId"),
                });

                if (doctorFetchingError) {
                    return res.status(400).json({
                        id: 18,
                        statusCode: 400,
                        message: message,
                    });
                }
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Doctor fetched successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: doctor,
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
        console.log("Some error occured in the auth-doctors fetch route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.put("/update", [
    body('doctorUpdates').isObject().withMessage('Doctor updates must be an object'),
    header('doctorId').notEmpty().withMessage('Doctor ID is required'),
], verifyUser, async (req, res) => {
    try {
        if (req.header("serverPass") === process.env.SERVER_PASSWORD) {
            const { doctorUpdates } = req.body;
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

            const { doctor, doctorUpdatingError, message } = await updateDoctor({
                id: req.header("doctorId"),
                doctorUpdates: doctorUpdates,
            });

            if (doctorUpdatingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Doctor data updated successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: doctor,
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
        console.log("Some error occured in the auth-doctors update route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

router.delete("/delete", [
    header('doctorId').notEmpty().withMessage('Doctor ID is required'),
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

            const { doctor, doctorDeletingError, message } = await deleteDoctor({
                id: req.header("doctorId"),
            });

            if (doctorDeletingError) {
                return res.status(400).json({
                    id: 18,
                    statusCode: 400,
                    message: message,
                });
            } else {
                return res.status(200).json({
                    id: 12,
                    statusCode: 200,
                    message: "Doctor deleted successfully...",
                    password: process.env.CLIENT_PASSWORD,
                    data: doctor,
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
        console.log("Some error occured in the auth-doctors delete route: ", error);
        return res.status(500).json({
            id: 20,
            statusCode: 500,
            message: "Internal server error...",
        });
    }
});

module.exports = router;

