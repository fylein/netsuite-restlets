/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record'], function (record) {
    
    // Function called upon sending a POST request to create a new credit card refund record
    function doPost(requestBody) {
        var creditCardRefund = CreateNetSuiteCreditCardRefund(requestBody);
        if (creditCardRefund.success) {
            log.debug('CCC Refund', creditCardRefund);
            return creditCardRefund;
        } else {
            log.debug('CCC Refund', 'Fail');
            return creditCardRefund;
        }
    }

    // Function called upon sending a GET request to retrieve a record
    function doGet(requestParams) {
        try {
            // Load the credit card refund record in dynamic mode
            var creditCardRefund = record.load({
                type: record.Type.CREDIT_CARD_REFUND,
                id: requestParams.internalId,
                isDynamic: true
            });

            // Prepare the response object with all relevant fields
            var response = {
                internalId: creditCardRefund.id,
                entity: creditCardRefund.getValue('entity'),
                subsidiary: creditCardRefund.getValue('subsidiary'),
                account: creditCardRefund.getValue('account'),
                memo: creditCardRefund.getValue('memo'),
                trandate: creditCardRefund.getValue('trandate'),
                tranid: creditCardRefund.getValue('tranid'),
                location: creditCardRefund.getValue('location'),
                department: creditCardRefund.getValue('department'),
                class: creditCardRefund.getValue('class'),
                currency: creditCardRefund.getValue('currency'),
                externalid: creditCardRefund.getValue('externalid'),
                expenses: []
            };

            // Fetch the expense sublist lines
            var lineCount = creditCardRefund.getLineCount({ sublistId: 'expense' });
            for (var i = 0; i < lineCount; i++) {
                var expense = {
                    account: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'account', line: i }),
                    amount: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'amount', line: i }),
                    memo: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'memo', line: i }),
                    department: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'department', line: i }),
                    class: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'class', line: i }),
                    location: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'location', line: i }),
                    customer: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'customer', line: i }),
                    isBillable: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'isbillable', line: i }),
                    taxCode: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'taxcode', line: i }),
                    taxAmount: creditCardRefund.getSublistValue({ sublistId: 'expense', fieldId: 'taxamount', line: i }),
                    customFields: {
                        custcolfyle_receipt_link: creditCardRefund.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_receipt_link',
                            line: i
                        }),
                        custcolfyle_receipt_link_2: creditCardRefund.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_receipt_link_2',
                            line: i
                        }),
                        custcolfyle_expense_url: creditCardRefund.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_expense_url',
                            line: i
                        }),
                        custcolfyle_expense_url_2: creditCardRefund.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_expense_url_2',
                            line: i
                        })
                    }
                };

                // Push the expense object to the response
                response.expenses.push(expense);
            }

            return response;
        } catch (e) {
            log.error('Error in doGet', e);
            return { success: false, message: e.message };
        }
    }

    // Function called upon sending a PUT request to update a record
    function doPut(requestBody) {
        try {
            var creditCardRefund = record.load({
                type: record.Type.CREDIT_CARD_REFUND,
                id: requestBody.internalId,
                isDynamic: true
            });

            creditCardRefund.setValue({ fieldId: 'entity', value: requestBody.entity.internalId });
            creditCardRefund.setValue({ fieldId: 'account', value: requestBody.account.internalId });
            creditCardRefund.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
            creditCardRefund.setValue({ fieldId: 'tranid', value: requestBody.tranid });
            creditCardRefund.setValue({ fieldId: 'location', value: requestBody.location.internalId });
            creditCardRefund.setValue({ fieldId: 'department', value: requestBody.department.internalId });
            creditCardRefund.setValue({ fieldId: 'class', value: requestBody.class.internalId });
            creditCardRefund.setValue({ fieldId: 'currency', value: requestBody.currency.internalId });
            creditCardRefund.setValue({ fieldId: 'memo', value: requestBody.memo });
            creditCardRefund.setValue({ fieldId: 'externalid', value: requestBody.externalId });

            // First, remove existing expense lines
            var expenseLineCount = creditCardRefund.getLineCount({ sublistId: 'expense' });
            for (var i = expenseLineCount - 1; i >= 0; i--) {
                creditCardRefund.removeLine({ sublistId: 'expense', line: i });
            }

            // Add the new expense lines
            var expenses = requestBody.expenses;
            expenses.forEach(function (expense) {
                creditCardRefund.selectNewLine({ sublistId: 'expense' });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'account',
                    value: expense.account.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'amount',
                    value: expense.amount
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'memo',
                    value: expense.memo
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'department',
                    value: expense.department.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'class',
                    value: expense.class.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'location',
                    value: expense.location.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'customer',
                    value: expense.customer.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'isbillable',
                    value: expense.isBillable
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'taxcode',
                    value: expense.taxCode.internalId
                });

                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'taxamount',
                    value: expense.taxAmount
                });

                expense.customFieldList.forEach(function (customField) {
                    creditCardRefund.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: customField.scriptId,
                        value: customField.value
                    });
                });

                creditCardRefund.commitLine({ sublistId: 'expense' });
            });

            var id = creditCardRefund.save();
            return { internalId: id, success: true };

        } catch (e) {
            log.error('Error in doPut', e);
            return { success: false, message: e.message };
        }
    }

    function CreateNetSuiteCreditCardRefund(requestBody) {
        log.debug('Post body', requestBody);
        log.debug(record.Type.CREDIT_CARD_REFUND);
        var creditCardRefund = record.create({
            type: record.Type.CREDIT_CARD_REFUND,
            isDynamic: true
        });

        creditCardRefund.setValue({ fieldId: 'entity', value: requestBody.entity.internalId });
        creditCardRefund.setValue({ fieldId: 'subsidiary', value: requestBody.subsidiary.internalId });
        creditCardRefund.setValue({ fieldId: 'account', value: requestBody.account.internalId });
        creditCardRefund.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
        creditCardRefund.setValue({ fieldId: 'tranid', value: requestBody.tranid });
        creditCardRefund.setValue({ fieldId: 'location', value: requestBody.location.internalId });
        creditCardRefund.setValue({ fieldId: 'department', value: requestBody.department.internalId });
        creditCardRefund.setValue({ fieldId: 'class', value: requestBody.class.internalId });
        creditCardRefund.setValue({ fieldId: 'currency', value: requestBody.currency.internalId });
        creditCardRefund.setValue({ fieldId: 'memo', value: requestBody.memo });
        creditCardRefund.setValue({ fieldId: 'externalid', value: requestBody.externalId });

        creditCardRefund.selectNewLine({ sublistId: 'expense' });

        var expenses = requestBody.expenses;

        expenses.forEach(function (expense) {
            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: expense.account.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'amount',
                value: expense.amount
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'memo',
                value: expense.memo
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'department',
                value: expense.department.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'class',
                value: expense.class.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'location',
                value: expense.location.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'customer',
                value: expense.customer.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'isbillable',
                value: expense.isBillable
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxcode',
                value: expense.taxCode.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxamount',
                value: expense.taxAmount
            });

            expense.customFieldList.forEach(function (customField) {
                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: customField.scriptId,
                    value: customField.value
                });
            });

            creditCardRefund.commitLine({ sublistId: 'expense' });
        });
        log.debug('ccc_refund', creditCardRefund);
        var id = creditCardRefund.save({});
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
