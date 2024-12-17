import { useQuery } from 'urql';
import { showNotification } from '@mantine/notifications';
import { AllCountriesDocument, AllCountriesQuery } from '../gql/graphql.js';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- used by codegen
/* GraphQL */ `
  query AllCountries {
    allCountries {
      id
      name
      code
    }
  }
`;

type AllCountries = Array<Omit<AllCountriesQuery['allCountries'][number], '__typename' | 'id'>>;

type UseAllCountries = {
  fetching: boolean;
  refresh: () => void;
  countries: AllCountries;
};

export const useAllCountries = (): UseAllCountries => {
  const [{ data, fetching, error }, fetch] = useQuery({ query: AllCountriesDocument });

  if (error) {
    console.error(`Error fetching countries: ${error}`);
    showNotification({
      title: 'Error',
      message: 'Unable to fetch countries',
    });
  }

  return {
    fetching,
    refresh: () => fetch(),
    countries: data?.allCountries ?? [],
  };
};