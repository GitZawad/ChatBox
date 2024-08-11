'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi, I'm headstarter support AI at your service. How can I assist you today?`
  }])
  const [message, setMessage] = useState('')

  const sendMessage = async() =>{
    setMessage('')
    setMessages((messages) => [
        ...messages,
        {role: "user", content: message},
        {role: "assistant", content: ''},
    ])
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}])
    }).then( async (res)=> {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}){
          if(done){
            return result
          }
          const text = decoder.decode(value || Int8Array(), {stream: true})
          setMessages((messages) => {
           
            let lastMessage = messages[messages.length-1]
            let otherMessages = messages.slice(0, messages.length-1)
           
            return[
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              },
            ]
          })
          return reader.read().then(processText)
      })
    })
  }

  return <Box height="100vh"
  width="100vw"
  display="flex"
  flexDirection="column"
  justifyContent="center"
  alignItems="center">
    <Stack
      direction="column"
      height="700px"
      width="600px"
      border="1px solid Black"
      p={2}
      space={3}
      >
        <Stack direction="column"
        spacing={2}
        flexGrow={1}
        overflow="auto"
        maxHeight="100%">
          {
            messages.map((message, index) => (
            
              <Box key={index}  
              display='flex'
              justifyContent={
                message.role=== 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  message.role === 'assistant' ? '#00796b' : '#757575' // Custom colors
                }
                color="white"
                p={3}
                borderRadius={16}>
                  {message.content}
                </Box>
              </Box>
            ))
          }
          
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
          
          label = "message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}>
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          </TextField>
          <Button 
            variant="contained" 
            onClick={sendMessage}
            sx={{
              bgcolor: '#00796b', // Button background color
              '&:hover': {
                bgcolor: '#004d40', // Darker shade on hover
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
  </Box>
}