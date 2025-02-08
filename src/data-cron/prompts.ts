import { ICleanedData } from './server';

const prompts = {
    google: {
        searchPrompt: (data: ICleanedData) => {
            return {
                message: `
                    You are a world expert in analyzing Google activity data and generating category lists. Your task is to parse the provided search history and create two lists of categories based solely on this data.

                    Task 1: Generate a list of general interest categories
                    * Create an array of up to 40 categories that the user is interested in and may want to search more about.
                    * Base this list entirely on the data provided, nothing else.
                    * Order the results from what the user appears most interested in to least interested.
                    * Use reasonably refined categories (e.g., "rugby" instead of simply "sport" or "crypto" instead of just "finance") but not too specific.

                    Task 2: Generate a list of e-commerce categories
                    * Create an array of up to 30 general e-commerce categories that the user is interested in and may wish to explore for potential purchases.
                    * Base this list entirely on the data provided, nothing else.
                    * Order the results from most interested to least interested.
                    * Focus on categories where products are commonly purchased online.

                    For both tasks:
                    * If a search query could fit multiple categories, assign it to the most relevant one based on context.
                    * If there's not enough data to generate the full number of categories, do not infer other categories.

                    Output: Provide the response in JSON format, structured as follows. Do not return anything but the two lists in the response in the following format:
                    
                    {
                        "topics": [ "Category1", "Category2", ... ], 
                        "ecommerce": [ "Category1", "Category2", ... ] 
                    }

                    Here is the data:
                    ${JSON.stringify(data)}
                `
            };
        },
        youtubePrompt: (data: ICleanedData) => {
            return {
                message: `
                    You are a world expert in analyzing Youtube activity data and generating category lists. Your task is to parse the provided search history and create two lists of categories based solely on this data.

                    Task 1: Generate a list of general interest categories
                    * Create an array of up to 40 categories that the user is interested in and may want to search more about.
                    * Base this list entirely on the data provided, nothing else.
                    * Order the results from what the user appears most interested in to least interested.
                    * Use reasonably refined categories (e.g., "rugby" instead of simply "sport" or "crypto" instead of just "finance") but not too specific.

                    Task 2: Generate a list of e-commerce categories
                    * Create an array of up to 30 general e-commerce categories that the user is interested in and may wish to explore for potential purchases.
                    * Base this list entirely on the data provided, nothing else.
                    * Order the results from most interested to least interested.
                    * Focus on categories where products are commonly purchased online.

                    For both tasks:
                    * If a search query could fit multiple categories, assign it to the most relevant one based on context.
                    * If there's not enough data to generate the full number of categories, do not infer other categories.

                    Output: Provide the response in JSON format, structured as follows. Do not return anything but the two lists in the response in the following format:

                    {
                        "topics": [ "Category1", "Category2", ... ], 
                        "ecommerce": [ "Category1", "Category2", ... ] 
                    }

                    Here is the data:
                    ${JSON.stringify(data)}
                `
            };
        }
    }
};

export { prompts };
