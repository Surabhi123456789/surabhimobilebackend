class ApiFeatures {

    // ek query hai ex(prodict.find()) and query str hm link me as a keyword bhejte hai keyword=happy
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    search(){
        const keyword = this.queryStr.keyword ? {
            name : {
                $regex:this.queryStr.keyword,
                // case sensitive
                $options: "i",
            },

        }:{};

        this.query = this.query.find({...keyword});
        return this;

    }

    filter(){
        // queryStr ek object hai aur javascript me object hmesha through refrence pass hote hai
        // direct qc = this.qurStr krne pe copy wale me change krte toh wo main me bhi reflect 

        const queryCopy ={...this.queryStr}
        console.log(queryCopy);

        // removing some fields for category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key=>delete queryCopy[key]);

        // filter from price and ratings
         let queryStr = JSON.stringify(queryCopy);
         queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key =>`$${key}`);  

        // console.log(queryCopy);
        this.query = this.query.find(JSON.parse(queryStr));

        
        return this ;



    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;  
        // 50 product per page 10 then agar 20 pages dikhane hai toh suru k 10 skip krna honge jab 11-20 dikhaynege
        const skip = resultPerPage *(currentPage-1);
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this;  
    }
}
module.exports = ApiFeatures;