import Upload from 'src/components/upload.vue'

describe('upload', () => {
  it('has a mounted hook', () => {
    expect(typeof Upload.created).to.equal('function')
  })

  it('has data', () => {
    expect(typeof Upload.data).to.equal('function')
  })

  it('has correct data', () => {
    let data = Upload.data()
    expect(data.info.nbOfPoints).to.be.a('number')
    expect(data.info.reducedNbOfPoints).to.be.a('number')
    expect(data.info.elevationGain).to.be.a('number')
    expect(data.info.distance).to.be.a('number')
  })
})
