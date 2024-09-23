/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record'], function (record) {

    // Function called upon sending a POST request to create a new credit card charge record
    function doPost(requestBody) {
        var creditCardCharge = CreateNetSuiteCreditCardCharge(requestBody);
        if (creditCardCharge.success) {
            log.debug('CCC', creditCardCharge);
            return creditCardCharge;
        } else {
            log.debug('CCC', 'Fail');
            return creditCardCharge;
        }
    }

    // Function called upon sending a GET request to retrieve a record
    function doGet(requestParams) {
        try {
            // Load the credit card charge record in dynamic mode
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestParams.internalId,
                isDynamic: true
            });
    
            return creditCardCharge;
        } catch (e) {
            log.error('Error in doGet', e);
            return { success: false, message: e.message };
        }
    }    

    // Function called upon sending a PUT request to update a record
    function doPut(requestBody) {
        try {
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestBody.internalId,
                isDynamic: true
            });
            
            if (requestBody.entity) { creditCardCharge.setValue({ fieldId: 'entity', value: requestBody.entity.internalId }); }
            if (requestBody.account) { creditCardCharge.setValue({ fieldId: 'account', value: requestBody.account.internalId }); }
            if (requestBody.tranDate) {creditCardCharge.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) }); }
            if (requestBody.tranid) { creditCardCharge.setValue({ fieldId: 'tranid', value: requestBody.tranid }); }
            if (requestBody.location) { creditCardCharge.setValue({ fieldId: 'location', value: requestBody.location.internalId }); }
            if (requestBody.department) { creditCardCharge.setValue({ fieldId: 'department', value: requestBody.department.internalId }); }
            if (requestBody.class) { creditCardCharge.setValue({ fieldId: 'class', value: requestBody.class.internalId }); }
            if (requestBody.currency) { creditCardCharge.setValue({ fieldId: 'currency', value: requestBody.currency.internalId }); }
            if (requestBody.memo) { creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo }); }
            if (requestBody.externalId) { creditCardCharge.setValue({ fieldId: 'externalid', value: requestBody.externalId }); }

            // First, remove existing expense lines
            var expenseLineCount = creditCardCharge.getLineCount({ sublistId: 'expense' });
            for (var i = expenseLineCount - 1; i >= 0; i--) {
                creditCardCharge.removeLine({ sublistId: 'expense', line: i });
            }

            // Add the new expense lines
            var expenses = requestBody.expenses;
            expenses.forEach(function (expense) {
                creditCardCharge.selectNewLine({ sublistId: 'expense' });

                if (expense.account) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'account', value: expense.account.internalId }); }
                if (expense.amount) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'amount', value: expense.amount }); }
                if (expense.memo) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'memo', value: expense.memo }); }
                if (expense.department) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'department', value: expense.department.internalId }); }
                if (expense.class) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'class', value: expense.class.internalId }); }
                if (expense.location) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'location', value: expense.location.internalId }); }
                if (expense.customer) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'customer', value: expense.customer.internalId }); }
                if (expense.isBillable) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'isbillable', value: expense.isBillable }); }
                if (expense.taxCode) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'taxcode', value: expense.taxCode.internalId }); }
                if (expense.taxAmount) { creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'taxamount', value: expense.taxAmount }); }
    
                if (expense.customFieldList) {
                    expense.customFieldList.forEach(function (customField) {
                        creditCardCharge.setCurrentSublistValue({ sublistId: 'expense', fieldId: customField.scriptId, value: customField.value });
                    });
                }

                creditCardCharge.commitLine({ sublistId: 'expense' });
            });

            var id = creditCardCharge.save();
            return { internalId: id, success: true };

        } catch (e) {
            log.error('Error in doPut', e);
            return { success: false, message: e.message };
        }
    }

    function CreateNetSuiteCreditCardCharge(requestBody) {
        log.debug('Post body', requestBody);
        log.debug(record.Type.CREDIT_CARD_CHARGE);
        var creditCardCharge = record.create({
            type: record.Type.CREDIT_CARD_CHARGE,
            isDynamic: true
        });

        creditCardCharge.setValue({ fieldId: 'entity', value: requestBody.entity.internalId });
        creditCardCharge.setValue({ fieldId: 'subsidiary', value: requestBody.subsidiary.internalId });
        creditCardCharge.setValue({ fieldId: 'account', value: requestBody.account.internalId });
        creditCardCharge.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
        creditCardCharge.setValue({ fieldId: 'tranid', value: requestBody.tranid });
        creditCardCharge.setValue({ fieldId: 'location', value: requestBody.location.internalId });
        creditCardCharge.setValue({ fieldId: 'department', value: requestBody.department.internalId });
        creditCardCharge.setValue({ fieldId: 'class', value: requestBody.class.internalId });
        creditCardCharge.setValue({ fieldId: 'currency', value: requestBody.currency.internalId });
        creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo });
        creditCardCharge.setValue({ fieldId: 'externalid', value: requestBody.externalId });


        creditCardCharge.selectNewLine({
            sublistId: 'expense'
        });


        var expenses = requestBody.expenses

        expenses.forEach(function (expense) {
            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: expense.account.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'amount',
                value: expense.amount
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'memo',
                value: expense.memo
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'department',
                value: expense.department.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'class',
                value: expense.class.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'location',
                value: expense.location.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'customer',
                value: expense.customer.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'isbillable',
                value: expense.isBillable
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxcode',
                value: expense.taxCode.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxamount',
                value: expense.taxAmount
            });

            expense.customFieldList.forEach(function (customField) {
                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: customField.scriptId,
                    value: customField.value
                });
            });

            creditCardCharge.commitLine({
                sublistId: 'expense'
            });

        });
        log.debug('ccc_charge', creditCardCharge);
        var id = creditCardCharge.save({});
        log.debug('record save with id', id);

        return { internalId: id, success: true };
    }

    // Return the RESTlet methods for each HTTP method
    return {
        'get': doGet,
        'post': doPost,
        'put': doPut
    };

});