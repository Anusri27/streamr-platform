import axios from 'axios'

const API = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

const getData = ({ data }) => data

export async function send({
    authKey,
    data = {},
    dashboardId,
    canvasId,
    moduleHash,
}) {
    const dashboardPath = dashboardId ? `/dashboards/${dashboardId}` : ''
    const modulePath = `/canvases/${canvasId}/modules/${moduleHash}`
    const url = `${process.env.STREAMR_API_URL}${dashboardPath}${modulePath}/request`
    return API.post(url, {
        type: 'json',
        ...data,
    }, {
        Authorization: `Token ${authKey}`,
    }).then(getData)
}
