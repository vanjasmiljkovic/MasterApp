export const StorageConfig = {
    pdf: {
        destination: '../storage/pdfs/',
        urlPrefix: '/assets/pdfs',
        maxAge: 1000 * 60 * 60 * 24 * 7, //broj milisekundi - 7 dana
    },
    photo: {
        destination: '../storage/photos/',
        urlPrefix: '/assets/photos', //url kako treba da izgleda da bi se pristupilo photo
        maxAge: 1000 * 60 * 60 * 24 * 7, //broj milisekundi - 7 dana
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