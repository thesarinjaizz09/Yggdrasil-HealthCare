const employees = require("../db/models/employee-model")
const encrypter = require("../utils/encryption/encrypter")

const addEmployees = async ({ name, email, password, number }) => {
    try {
        const newEmployee = await employees.create({
            _name: name,
            _email: email,
            _password: await encrypter(password),
            _number: number
        })

        if (newEmployee) {
            return {
                newEmployee
            }
        } else {
            return {
                message: "Employee adding thread failed...",
                employeeAddingError: "Unknown error occurred"
            }
        }
    } catch (err) {
        console.log(err)
        return {
            message: "Employee adding thread denied...",
            employeeAddingError: err
        }
    }
}

const getEmployees = async ({ id }) => {
    try {
        const employee = await employees.findById(id).select("-_password");
        if (!employee) {
            return {
                message: 'Employee fetching thread failed...',
                employeeFetchingError: "Unknown error occurred"
            }
        } else {
            return {
                employee
            }
        }
    } catch (err) {
        return {
            message: 'Employee fetching thread denied...',
            employeeFetchingError: err
        }
    }
}

const updateEmployees = async ({ id, employeeUpdates }) => {
    try {
        await employees.findByIdAndUpdate(id, employeeUpdates)
        const updatedEmployee = await employees.findById(id)

        if (!updatedEmployee) {
            return {
                message: 'Employee upadation thread failed...',
                employeeUpdatingError: "Unknown error occurred"
            }
        } else {
            return {
                updatedEmployee
            }
        }
    } catch (err) {
        return {
            message: 'Employee updation thread denied...',
            employeeUpdatingError: err
        }
    }
}

const deleteEmployees = async ({ id }) => {
    try {
        const deletedEmployee = await employees.findByIdAndDelete(id);

        if (!deletedEmployee) {
            return {
                message: 'Employee deletion thread failed...',
                employeeDeletionError: "Unknown error occurred"
            }
        } else {
            return {
                deletedEmployee
            }
        }
    } catch (err) {
        return {
            message: 'Employee deletion thread denied...',
            employeeDeletionError: err
        }
    }
}

const fetchEmployees = async () => {
    try {
        const employeeList = await employees.find().select("_name _email _number _employeeId");
        if (!employeeList || employeeList.length === 0) {
            return {
                message: 'Employee fetching thread failed...',
                employeeFetchingError: "No employees found"
            }
        } else {
            return {
                employeeList
            }
        }
    } catch (err) {
        return {
            message: 'Employee fetching thread denied...',
            employeeFetchingError: err
        }
    }
}

module.exports = {
   addEmployees,
   getEmployees,
   updateEmployees,
   fetchEmployees,
   deleteEmployees
}