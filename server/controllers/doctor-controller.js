const doctors = require("../db/models/doctor-model")

const addDoctor = async ({ name, degree, signature, number }) => {
    try {
        const newDoctor = await doctors.create({
            _name: name,
            _degree: degree,
            _signature: signature,
            _number: number
        })

        if (newDoctor) {
            return {
                newDoctor
            }
        } else {
            return {
                message: "Doctor adding thread failed...",
                doctorAddingError: "Unknown error occurred"
            }
        }
    } catch (err) {
        return {
            message: "Doctor adding thread denied...",
            doctorAddingError: err
        }
    }
}

const getDoctor = async ({ id }) => {
    try {
        const doctor = await doctors.findById(id);
        if (!doctor) {
            return {
                message: 'Doctor fetching thread failed...',
                doctorFetchingError: "Unknown error occurred"
            }
        } else {
            return {
                doctor
            }
        }
    } catch (err) {
        return {
            message: 'Doctor fetching thread denied...',
            doctorFetchingError: err
        }
    }
}

const updateDoctor = async ({ id, doctorUpdates }) => {
    try {
        await doctors.findByIdAndUpdate(id, doctorUpdates)
        const updatedDoctor = await doctors.findById(id)

        if (!updatedDoctor) {
            return {
                message: 'Doctor upadation thread failed...',
                doctorUpdatingError: "Unknown error occurred"
            }
        } else {
            return {
                updatedDoctor
            }
        }
    } catch (err) {
        return {
            message: 'Doctor updation thread denied...',
            doctorUpdatingError: err
        }
    }
}

const deleteDoctor = async ({ id }) => {
    try {
        const deletedDoctor = await doctors.findByIdAndDelete(id);

        if (!deletedDoctor) {
            return {
                message: 'Doctor deletion thread failed...',
                doctorDeletionError: "Unknown error occurred"
            }
        } else {
            return {
                deletedDoctor
            }
        }
    } catch (err) {
        return {
            message: 'Doctor deletion thread denied...',
            doctorDeletionError: err
        }
    }
}

const fetchDoctors = async () => {
    try {
        const doctorList = await doctors.find();
        if (!doctorList || doctorList.length === 0) {
            return {
                message: 'Doctor fetching thread failed...',
                doctorFetchingError: "No doctors found"
            }
        } else {
            return {
                doctorList
            }
        }
    } catch (err) {
        return {
            message: 'Doctor fetching thread denied...',
            doctorFetchingError: err
        }
    }
}

module.exports = {
    addDoctor,
    getDoctor,
    updateDoctor,
    fetchDoctors,
    deleteDoctor
}