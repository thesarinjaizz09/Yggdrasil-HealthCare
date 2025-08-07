const patients = require("../db/models/patient-model")

const addPatient = async ({ name, dateOfBirth, gender, number, address, bloodGroup, referDoctor, prescribedTests, totalPrice }) => {
    try {
        const newPatient = await patients.create({
            _name: name,
            _dateOfBirth: dateOfBirth,
            _gender: gender,
            _contactNumber: number,
            _address: address,
            _bloodGroup: bloodGroup,
            _referDoctor: referDoctor,
            _prescribedTests: prescribedTests,
            _totalPrice: totalPrice
        })

        if (newPatient) {
            return {
                newPatient
            }
        } else {
            return {
                message: "Patient adding thread failed...",
                patientAddingError: "Unknown error occurred"
            }
        }
    } catch (err) {
        return {
            message: "Patient adding thread denied...",
            patientAddingError: err
        }
    }
}

const getPatient = async ({ id }) => {
    try {
        const patient = await patients.findById(id);
        if (!patient) {
            return {
                message: 'Patient fetching thread failed...',
                patientFetchingError: "Unknown error occurred"
            }
        } else {
            return {
                patient
            }
        }
    } catch (err) {
        return {
            message: 'Patient fetching thread denied...',
            patientFetchingError: err
        }
    }
}

const updatePatient = async ({ id, patientUpdates }) => {
    try {
        await patients.findByIdAndUpdate(id, patientUpdates)
        const updatedPatient = await patients.findById(id)

        if (!updatedPatient) {
            return {
                message: 'Patient upadation thread failed...',
                patientUpdatingError: "Unknown error occurred"
            }
        } else {
            return {
                updatedPatient
            }
        }
    } catch (err) {
        return {
            message: 'Patient updation thread denied...',
            patientUpdatingError: err
        }
    }
}

const deletePatient = async ({ id }) => {
    try {
        const deletedPatient = await patients.findByIdAndDelete(id);

        if (!deletedPatient) {
            return {
                message: 'Patient deletion thread failed...',
                patientDeletionError: "Unknown error occurred"
            }
        } else {
            return {
                deletedPatient
            }
        }
    } catch (err) {
        return {
            message: 'Patient deletion thread denied...',
            patientDeletionError: err
        }
    }
}

const fetchPatients = async () => {
    try {
        const patientList = await patients.find().select("_name _dateOfBirth _gender _contactNumber _referDoctor _registrationDate _testCompletionDate _isAllTestCompleted _totalPrice");
        if (!patientList || patientList.length === 0) {
            return {
                message: 'Patient fetching thread failed...',
                patientFetchingError: "No patients found"
            }
        } else {
            return {
                patientList
            }
        }
    } catch (err) {
        return {
            message: 'Patient fetching thread denied...',
            patientFetchingError: err
        }
    }
}

module.exports = {
    addPatient,
    getPatient,
    updatePatient,
    fetchPatients,
    deletePatient
}