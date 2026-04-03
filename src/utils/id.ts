



export class IdUtils {


    public static generateNextId(items : {id: number}[]): number {

        if(items.length === 0){
            return 1;
        }

        let maxId = 0;

        for(const item of items){
            if(item.id > maxId){
                maxId = item.id;
            }
        }

        return maxId +1;
    }

}