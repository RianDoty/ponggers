import io from "socket.io-client";

console.log('Initializing socket.')
const socket = io('/')

socket.on('connect', ()=>console.log('Socket connected.'))
socket.on('connect_error', (e)=>{
    console.error('Error with socket connection:')
    console.error(e)
})
export default socket;