import { GraphQLError } from 'graphql';
import {
  coreExpenseUpdate,
  generateChargeForEmployeePayment,
  updateExistingTripExpense,
} from '../helpers/business-trips-expenses.helper.js';
import { BusinessTripEmployeePaymentsProvider } from '../providers/business-trips-employee-payments.provider.js';
import { BusinessTripAccommodationsExpensesProvider } from '../providers/business-trips-expenses-accommodations.provider.js';
import { BusinessTripFlightsExpensesProvider } from '../providers/business-trips-expenses-flights.provider.js';
import { BusinessTripOtherExpensesProvider } from '../providers/business-trips-expenses-other.provider.js';
import { BusinessTripTravelAndSubsistenceExpensesProvider } from '../providers/business-trips-expenses-travel-and-subsistence.provider.js';
import { BusinessTripExpensesProvider } from '../providers/business-trips-expenses.provider.js';
import type { BusinessTripsModule } from '../types.js';
import { commonBusinessTripExpenseFields } from './common.js';

export const businessTripExpensesResolvers: BusinessTripsModule.Resolvers = {
  Mutation: {
    categorizeBusinessTripExpense: async (
      _,
      { fields: { businessTripId, transactionId, category, amount } },
      { injector },
    ) => {
      try {
        if (!category) {
          throw new GraphQLError(`Category is required`);
        }

        const [businessTripExpense] = await injector
          .get(BusinessTripExpensesProvider)
          .insertBusinessTripExpense({
            businessTripId,
            category,
          });
        const id = businessTripExpense.id;

        await updateExistingTripExpense(injector, id, transactionId, category, amount);

        return id;
      } catch (e) {
        console.error(`Error updating business trip expense's category`, e);
        throw new GraphQLError("Error updating charge's business trip");
      }
    },
    categorizeIntoExistingBusinessTripExpense: async (
      _,
      { fields: { businessTripExpenseId, transactionId, amount } },
      { injector },
    ) => {
      try {
        if (!transactionId) {
          throw new GraphQLError(`Expense ID is required`);
        }

        const businessTripExpense = await injector
          .get(BusinessTripExpensesProvider)
          .getBusinessTripsExpensesByIdLoader.load(businessTripExpenseId);

        if (!businessTripExpense) {
          throw new GraphQLError(
            `Business trip expense with id ${businessTripExpenseId} not found`,
          );
        }

        await injector.get(BusinessTripExpensesProvider).insertBusinessTripExpenseMatch({
          businessTripExpenseId,
          transactionId,
          amount,
        });

        return businessTripExpense.id!;
      } catch (e) {
        console.error(`Error updating business trip expense's category`, e);
        throw new GraphQLError("Error updating charge's business trip");
      }
    },
    updateBusinessTripFlightsExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpenseUpdatePromise = coreExpenseUpdate(injector, fields, 'FLIGHT');

        const { id, origin, destination, flightClass } = fields;
        const hasFlightFieldsToUpdate = origin || destination || flightClass;
        const flightExpenseUpdate = hasFlightFieldsToUpdate
          ? injector.get(BusinessTripFlightsExpensesProvider).updateBusinessTripFlightsExpense({
              businessTripExpenseId: id,
              origin,
              destination,
              class: flightClass,
            })
          : Promise.resolve();

        await Promise.all([coreExpenseUpdatePromise, flightExpenseUpdate]);

        return id;
      } catch (e) {
        console.error(`Error updating business trip flight expense`, e);
        throw new GraphQLError('Error updating business trip flight expense');
      }
    },
    updateBusinessTripAccommodationsExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpenseUpdatePromise = coreExpenseUpdate(injector, fields, 'ACCOMMODATION');

        const { id, country, nightsCount } = fields;
        const hasAccommodationFieldsToUpdate = country || nightsCount;
        const accommodationExpenseUpdate = hasAccommodationFieldsToUpdate
          ? injector
              .get(BusinessTripAccommodationsExpensesProvider)
              .updateBusinessTripAccommodationsExpense({
                businessTripExpenseId: id,
                country,
                nightsCount,
              })
          : Promise.resolve();

        await Promise.all([coreExpenseUpdatePromise, accommodationExpenseUpdate]);

        return id;
      } catch (e) {
        console.error(`Error updating business trip accommodations expense`, e);
        throw new GraphQLError('Error updating business trip accommodations expense');
      }
    },
    updateBusinessTripOtherExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpenseUpdatePromise = coreExpenseUpdate(injector, fields, 'OTHER');

        const { id, description, deductibleExpense } = fields;
        const hasOtherFieldsToUpdate = description || deductibleExpense != null;
        const otherExpenseUpdate = hasOtherFieldsToUpdate
          ? injector.get(BusinessTripOtherExpensesProvider).updateBusinessTripOtherExpense({
              businessTripExpenseId: id,
              description,
              deductibleExpense,
            })
          : Promise.resolve();

        await Promise.all([coreExpenseUpdatePromise, otherExpenseUpdate]);

        return id;
      } catch (e) {
        console.error(`Error updating business trip other expense`, e);
        throw new GraphQLError('Error updating business trip other expense');
      }
    },
    updateBusinessTripTravelAndSubsistenceExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpenseUpdatePromise = coreExpenseUpdate(
          injector,
          fields,
          'TRAVEL_AND_SUBSISTENCE',
        );

        const { id, expenseType } = fields;
        const hasTravelAndSubsistenceFieldsToUpdate = expenseType;
        const travelAndSubsistenceExpenseUpdate = hasTravelAndSubsistenceFieldsToUpdate
          ? injector
              .get(BusinessTripTravelAndSubsistenceExpensesProvider)
              .updateBusinessTripTravelAndSubsistenceExpense({
                businessTripExpenseId: id,
                expenseType,
              })
          : Promise.resolve();

        await Promise.all([coreExpenseUpdatePromise, travelAndSubsistenceExpenseUpdate]);

        return id;
      } catch (e) {
        console.error(`Error updating business trip travel&subsistence expense`, e);
        throw new GraphQLError('Error updating business trip travel&subsistence expense');
      }
    },
    deleteBusinessTripExpense: async (_, { businessTripExpenseId }, { injector }) => {
      try {
        await Promise.all([
          injector
            .get(BusinessTripFlightsExpensesProvider)
            .deleteBusinessTripFlightsExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripAccommodationsExpensesProvider)
            .deleteBusinessTripAccommodationsExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripOtherExpensesProvider)
            .deleteBusinessTripOtherExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripTravelAndSubsistenceExpensesProvider)
            .deleteBusinessTripTravelAndSubsistenceExpense({ businessTripExpenseId }),
          injector.get(BusinessTripEmployeePaymentsProvider).deleteBusinessTripEmployeePayment({
            businessTripExpenseId,
          }),
          injector
            .get(BusinessTripExpensesProvider)
            .deleteBusinessTripExpenseMatch({ businessTripExpenseId }),
        ]);

        // core expense must be deleted AFTER all extensions were dropped
        await injector
          .get(BusinessTripExpensesProvider)
          .deleteBusinessTripExpense({ businessTripExpenseId });

        return true;
      } catch (e) {
        console.error(`Error deleting business trip expense`, e);
        throw new GraphQLError('Error deleting business trip expense');
      }
    },
    uncategorizePartialBusinessTripExpense: async (
      _,
      { transactionId, businessTripExpenseId },
      { injector },
    ) => {
      try {
        await Promise.all([
          injector
            .get(BusinessTripFlightsExpensesProvider)
            .deleteBusinessTripFlightsExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripAccommodationsExpensesProvider)
            .deleteBusinessTripAccommodationsExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripOtherExpensesProvider)
            .deleteBusinessTripOtherExpense({ businessTripExpenseId }),
          injector
            .get(BusinessTripTravelAndSubsistenceExpensesProvider)
            .deleteBusinessTripTravelAndSubsistenceExpense({ businessTripExpenseId }),
          injector.get(BusinessTripEmployeePaymentsProvider).deleteBusinessTripEmployeePayment({
            businessTripExpenseId,
          }),
          injector.get(BusinessTripExpensesProvider).deleteSpecificBusinessTripExpenseMatch({
            businessTripExpenseId,
            transactionId,
          }),
        ]);

        return true;
      } catch (e) {
        console.error(`Error deleting business trip expense part`, e);
        throw new GraphQLError('Error deleting business trip expense part');
      }
    },
    addBusinessTripFlightsExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpensePromise = injector
          .get(BusinessTripExpensesProvider)
          .insertBusinessTripExpense({
            businessTripId: fields.businessTripId,
            category: 'FLIGHT',
          })
          .then(res => res[0]);

        const chargeGenerationPromise = generateChargeForEmployeePayment(
          injector,
          fields.businessTripId,
        );

        const [coreExpense, chargeId] = await Promise.all([
          coreExpensePromise,
          chargeGenerationPromise,
        ]);

        await Promise.all([
          injector.get(BusinessTripFlightsExpensesProvider).insertBusinessTripFlightsExpense({
            id: coreExpense.id,
            origin: fields.origin,
            destination: fields.destination,
            class: fields.flightClass,
          }),
          injector.get(BusinessTripEmployeePaymentsProvider).insertBusinessTripEmployeePayment({
            businessTripExpenseId: coreExpense.id,
            chargeId,
            date: fields.date,
            valueDate: fields.valueDate,
            amount: fields.amount,
            currency: fields.currency,
            employeeBusinessId: fields.employeeBusinessId,
          }),
        ]);

        return coreExpense.id;
      } catch (e) {
        console.error(`Error adding new business trip flight expense`, e);
        throw new GraphQLError('Error adding new business trip flight expense');
      }
    },
    addBusinessTripAccommodationsExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpensePromise = injector
          .get(BusinessTripExpensesProvider)
          .insertBusinessTripExpense({
            businessTripId: fields.businessTripId,
            category: 'ACCOMMODATION',
          })
          .then(res => res[0]);

        const chargeGenerationPromise = generateChargeForEmployeePayment(
          injector,
          fields.businessTripId,
        );

        const [coreExpense, chargeId] = await Promise.all([
          coreExpensePromise,
          chargeGenerationPromise,
        ]);

        await Promise.all([
          injector
            .get(BusinessTripAccommodationsExpensesProvider)
            .insertBusinessTripAccommodationsExpense({
              id: coreExpense.id,
              country: fields.country,
              nightsCount: fields.nightsCount,
            }),
          injector.get(BusinessTripEmployeePaymentsProvider).insertBusinessTripEmployeePayment({
            businessTripExpenseId: coreExpense.id,
            chargeId,
            date: fields.date,
            valueDate: fields.valueDate,
            amount: fields.amount,
            currency: fields.currency,
            employeeBusinessId: fields.employeeBusinessId,
          }),
        ]);

        return coreExpense.id;
      } catch (e) {
        console.error(`Error adding new business trip accommodation expense`, e);
        throw new GraphQLError('Error adding new business trip accommodation expense');
      }
    },
    addBusinessTripOtherExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpensePromise = injector
          .get(BusinessTripExpensesProvider)
          .insertBusinessTripExpense({
            businessTripId: fields.businessTripId,
            category: 'OTHER',
          })
          .then(res => res[0]);

        const chargeGenerationPromise = generateChargeForEmployeePayment(
          injector,
          fields.businessTripId,
        );

        const [coreExpense, chargeId] = await Promise.all([
          coreExpensePromise,
          chargeGenerationPromise,
        ]);

        await Promise.all([
          injector.get(BusinessTripOtherExpensesProvider).insertBusinessTripOtherExpense({
            id: coreExpense.id,
            description: fields.description,
            deductibleExpense: fields.deductibleExpense,
          }),
          injector.get(BusinessTripEmployeePaymentsProvider).insertBusinessTripEmployeePayment({
            businessTripExpenseId: coreExpense.id,
            chargeId,
            date: fields.date,
            valueDate: fields.valueDate,
            amount: fields.amount,
            currency: fields.currency,
            employeeBusinessId: fields.employeeBusinessId,
          }),
        ]);

        return coreExpense.id;
      } catch (e) {
        console.error(`Error adding new business trip other expense`, e);
        throw new GraphQLError('Error adding new business trip other expense');
      }
    },
    addBusinessTripTravelAndSubsistenceExpense: async (_, { fields }, { injector }) => {
      try {
        const coreExpensePromise = injector
          .get(BusinessTripExpensesProvider)
          .insertBusinessTripExpense({
            businessTripId: fields.businessTripId,
            category: 'FLIGHT',
          })
          .then(res => res[0]);

        const chargeGenerationPromise = generateChargeForEmployeePayment(
          injector,
          fields.businessTripId,
        );

        const [coreExpense, chargeId] = await Promise.all([
          coreExpensePromise,
          chargeGenerationPromise,
        ]);

        await Promise.all([
          injector
            .get(BusinessTripTravelAndSubsistenceExpensesProvider)
            .insertBusinessTripTravelAndSubsistenceExpense({
              id: coreExpense.id,
              expenseType: fields.expenseType,
            }),
          injector.get(BusinessTripEmployeePaymentsProvider).insertBusinessTripEmployeePayment({
            businessTripExpenseId: coreExpense.id,
            chargeId,
            date: fields.date,
            valueDate: fields.valueDate,
            amount: fields.amount,
            currency: fields.currency,
            employeeBusinessId: fields.employeeBusinessId,
          }),
        ]);

        return coreExpense.id;
      } catch (e) {
        console.error(`Error adding new business trip travel & subsistence expense`, e);
        throw new GraphQLError('Error adding new business trip travel & subsistence expense');
      }
    },
  },
  BusinessTripAccommodationExpense: {
    __isTypeOf: DbExpense => DbExpense.category === 'ACCOMMODATION',
    ...commonBusinessTripExpenseFields,
    country: dbExpense => dbExpense.country,
    nightsCount: dbExpense => dbExpense.nights_count,
  },
  BusinessTripFlightExpense: {
    __isTypeOf: DbExpense => DbExpense.category === 'FLIGHT',
    ...commonBusinessTripExpenseFields,
    origin: dbExpense => dbExpense.origin,
    destination: dbExpense => dbExpense.destination,
    class: dbExpense => dbExpense.class,
  },
  BusinessTripTravelAndSubsistenceExpense: {
    __isTypeOf: DbExpense => DbExpense.category === 'TRAVEL_AND_SUBSISTENCE',
    ...commonBusinessTripExpenseFields,
    expenseType: dbExpense => dbExpense.expense_type,
  },
  BusinessTripOtherExpense: {
    __isTypeOf: DbExpense => DbExpense.category === 'OTHER',
    ...commonBusinessTripExpenseFields,
    description: dbExpense => dbExpense.description,
  },
};