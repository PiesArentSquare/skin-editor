import open from 'open'

export default () => {
    process.env.BROWSER = open.apps.firefox
    return {
        server: {
            open: true
        }
    }
}