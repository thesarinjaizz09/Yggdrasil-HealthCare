const tests = require("../db/models/test-model")

const addTests = async ({ name, code, description, category, price, units, normalRange, isSubtests, subtests }) => {
    try {
        const newTest = await tests.create({
            _name: name,
            _code: code,
            _description: description,
            _category: category,
            _price: price,
            _units: units,
            _normalRange: normalRange,
            _isSubtests: isSubtests,
            _subtests: subtests
        })

        if (newTest) {
            return {
                newTest
            }
        } else {
            return {
                message: "Test adding thread failed...",
                testAddingError: "Unknown error occurred"
            }
        }
    } catch (err) {
        return {
            message: "Test adding thread denied...",
            testAddingError: err
        }
    }
}

const getTests = async ({ id }) => {
    try {
        const test = await tests.findById(id);
        if (!test) {
            return {
                message: 'Test fetching thread failed...',
                testFetchingError: "Unknown error occurred"
            }
        } else {
            return {
                test
            }
        }
    } catch (err) {
        return {
            message: 'Test fetching thread denied...',
            testFetchingError: err
        }
    }
}

const updateTests = async ({ id, testUpdates }) => {
    try {
        await tests.findByIdAndUpdate(id, testUpdates)
        const updatedTest = await tests.findById(id)

        if (!updatedTest) {
            return {
                message: 'Test upadation thread failed...',
                testUpdatingError: "Unknown error occurred"
            }
        } else {
            return {
                updatedTest
            }
        }
    } catch (err) {
        return {
            message: 'Test updation thread denied...',
            testUpdatingError: err
        }
    }
}

const deleteTests = async ({ id }) => {
    try {
        const deletedTest = await tests.findByIdAndDelete(id);

        if (!deletedTest) {
            return {
                message: 'Test deletion thread failed...',
                testDeletionError: "Unknown error occurred"
            }
        } else {
            return {
                deletedTest
            }
        }
    } catch (err) {
        return {
            message: 'Test deletion thread denied...',
            testDeletionError: err
        }
    }
}

const fetchTests = async () => {
    try {
        const testList = await tests.find().select("_name _code _price _units _isSubtests");
        if (!testList || testList.length === 0) {
            return {
                message: 'Test fetching thread failed...',
                testFetchingError: "No tests found"
            }
        } else {
            return {
                testList
            }
        }
    } catch (err) {
        return {
            message: 'Test fetching thread denied...',
            testFetchingError: err
        }
    }
}

module.exports = {
    addTests,
    getTests,
    fetchTests,
    updateTests,
    deleteTests
}
 