export default abstract class AbstractError extends Error {
    constructor(message: string) {
        super(message);
    }

    /**
     * Donne le code HTTP.
     * https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP
     */
    abstract get code(): number;
}
