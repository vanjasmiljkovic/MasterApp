export const StorageConfig = {
    photo: {
        destination: '../storage/photos/',
        maxSize: 3 * 1024 * 1024, //u bajtovima = 3MB
        resize: {
            thumb: { //settings za thumb -> u article controller se koristi
                width: 120,
                height: 100,
                directory: 'thumb/'
            },
            small: { //settings za small -> u article controller se koristi
                width: 320,
                height: 240,
                directory: 'small/'
            },
        }
    },
    //ako imam i neki fajl jos ovde ga pisem
    //file :{ destination : }
};