function FmpLogViewModel(data, errors) {
    if (data) {
        this.Error = data.Error
        this.Message = data.Message
        this.CorrelationId = data.CorrelationId
    }
}
module.exports = FmpLogViewModel