const mobContext = {
    uiBlocks: {},
    get uiBlocksCounter () {
        return Object.keys(this.uiBlocks).length
    }
};

export {
    mobContext
}
