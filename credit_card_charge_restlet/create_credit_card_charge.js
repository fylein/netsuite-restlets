/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record'],
/**
 * @param {record} record
 */
function (record) {
    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a
     * string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json'
     * (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain';
     * return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
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

    function CreateNetSuiteCreditCardCharge(requestBody) {
        log.debug('Post body', requestBody);
        log.debug(record.Type.CREDIT_CARD_CHARGE);
        var creditCardCharge = record.create({
            type: record.Type.CREDIT_CARD_CHARGE,
            isDynamic: true,
            defaultValues: {
                entity: requestBody.entity.internalId
            }
        });

        creditCardCharge.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
        creditCardCharge.setValue({ fieldId: 'account', value: requestBody.account.internalId })
        creditCardCharge.setValue({ fieldId: 'location', value: requestBody.location.internalId })
        creditCardCharge.setValue({ fieldId: 'subsidiary', value: requestBody.subsidiary.internalId })
        creditCardCharge.setValue({ fieldId: 'currency', value: requestBody.currency.internalId })
        creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo })
        creditCardCharge.setValue({ fieldId: 'externalid', value: requestBody.externalId })


        creditCardCharge.selectNewLine({
            sublistId: 'expense'
        });


        var expenses = requestBody.expenses

        expenses.forEach(function (expense) {
            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: expense.account
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

        try {
            var id = creditCardCharge.save({
                ignoreMandatoryFields: false
            });
            log.debug('record save with id', id);

            return { internalId: id, success: true };
        } catch (e) {
            return { success: false, type: e.type, name: e.name, message: e.message };
        }
    }

    return {
        'post': doPost,
    };

});