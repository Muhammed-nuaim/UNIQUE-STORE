// const axios = require('axios');
// const convertCurrency = async (amount) => {
//   try {
//     const apiKey = process.env.OPEN_EXCHANGE_API_KEY; 
//     const fromCurrency = 'INR'
//     const toCurrency = 'USD'

//     const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
    
//     if (response.data && response.data.rates) {
//       const usdToInrRate = response.data.rates[fromCurrency];
//       const usdToUsdRate = response.data.rates[toCurrency];
//       const convertedAmount = amount * (usdToUsdRate / usdToInrRate);

//       console.log(convertedAmount);
      
      
//       return  convertedAmount.toFixed(2);;
//     } else {
//       throw new Error('Unable to retrieve exchange rates.');
//     }

//   } catch (error) {
//     console.error('Currency conversion error:', error);
//     throw error;
//   }
// };  

// module.exports=convertCurrency