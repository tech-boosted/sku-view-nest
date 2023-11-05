import axios from 'axios';

export const getProfilesFromAmazon = async (
  base_url: string,
  headers: any,
  country_code: string,
): Promise<{
  status: boolean;
  message: string | any[];
}> => {
  return axios
    .get(base_url + '/v2/profiles', { headers: headers })
    .then((res) => {
      console.log('Got profiles');
      const all_profiles_for_selected_country = [];
      for (let i = 0; i < res?.data.length; i++) {
        const element = res?.data[i];
        if (element['countryCode'] === country_code) {
          all_profiles_for_selected_country.push(element);
        }
      }
      return {
        status: true,
        message: all_profiles_for_selected_country,
      };
    })
    .catch((err) => {
      console.log(err?.response);

      if (err.response.status == 401) {
        // access_token expired
        console.log('token expired 401');
        return { status: false, message: err.response.status };
      } else {
        return {
          status: false,
          message: err.response.status,
        };
      }
    });
};
