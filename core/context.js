
const mobContext = {
    uiBlocks: {},
    get uiBlocksCounter () {
        return Object.keys(this.uiBlocks).length
    }
};

console.log(mobContext)

export {
    mobContext
}
