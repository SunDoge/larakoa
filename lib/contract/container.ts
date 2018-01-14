export interface Container{
    /**
     * instance
     */
    instance(abstract: any, instance: any): any;

    factory(abstract: any): any;
}