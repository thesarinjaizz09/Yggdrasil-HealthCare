const admins = require("../db/models/admin-model")
const encrypter = require("../utils/encryption/encrypter")

const addAdmin = async ({ name, email, password }) => {
    try {
        const newAdmin = await admins.create({
            _name: name,
            _email: email,
            _password: await encrypter(password),
        })

        if (newAdmin) {
            return {
                newAdmin
            }
        } else {
            return {
                message: "Admin adding thread failed...",
                adminAddingError: "Unknown error occurred"
            }
        }
    } catch (err) {
        return {
            message: "Admin adding thread denied...",
            adminAddingError: err
        }
    }
}

const getAdmin = async ({ id }) => {
    try {
        const admin = await admins.findById(id).select("-_password");
        if (!admin) {
            return {
                message: 'Admin fetching thread failed...',
                adminFetchingError: "Unknown error occurred"
            }
        } else {
            return {
                admin
            }
        }
    } catch (err) {
        return {
            message: 'Admin fetching thread denied...',
            adminFetchingError: err
        }
    }
}

const updateAdmin = async ({ id, adminUpdates }) => {
    try {
        await admins.findByIdAndUpdate(id, adminUpdates)
        const updatedAdmin = await admins.findById(id)

        if (!updatedAdmin) {
            return {
                message: 'Admin upadation thread failed...',
                adminUpdatingError: "Unknown error occurred"
            }
        } else {
            return {
                updatedAdmin
            }
        }
    } catch (err) {
        return {
            message: 'Admin updation thread denied...',
            adminUpdatingError: err
        }
    }
}

const deleteAdmin = async ({ id }) => {
    try {
        const deletedAdmin = await admins.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return {
                message: 'Admin deletion thread failed...',
                adminDeletionError: "Unknown error occurred"
            }
        } else {
            return {
                deletedAdmin
            }
        }
    } catch (err) {
        return {
            message: 'Admin deletion thread denied...',
            adminDeletionError: err
        }
    }
}

const fetchAdmins = async () => {
    try {
        const adminList = await admins.find().select("-_password");
        if (!adminList || adminList.length === 0) {
            return {
                message: 'Admin fetching thread failed...',
                adminFetchingError: "No admins found"
            }
        } else {
            return {
                adminList
            }
        }
    } catch (err) {
        return {
            message: 'Admin fetching thread denied...',
            adminFetchingError: err
        }
    }
}

module.exports = {
    addAdmin,
    getAdmin,
    updateAdmin,
    fetchAdmins,
    deleteAdmin
}