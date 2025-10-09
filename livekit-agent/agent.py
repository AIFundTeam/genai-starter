"""
LiveKit Voice Agent for genai-starter template

This agent provides voice interaction with the following features:
- Speech-to-text using LiveKit Inference
- LLM responses using LiveKit Inference (OpenAI GPT-4.1)
- Text-to-speech using LiveKit Inference
- Custom tool to call test-llm edge function
"""
import asyncio
import logging
import os
from typing import Annotated
import httpx
from livekit import agents
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import silero, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("voice-assistant")
logger.setLevel(logging.INFO)

# Version marker for deployment tracking
VERSION = "1.0.5"


def prewarm(proc: JobProcess):
    """Prewarm function to load models before agent starts"""
    proc.userdata["vad"] = silero.VAD.load()


class VoiceAssistant(Agent):
    """Voice assistant that can answer questions and call backend functions"""

    def __init__(self) -> None:
        # Get configuration from environment
        self.backend_url = os.environ.get("BACKEND_URL", "").rstrip("/")
        self.agent_secret = os.environ.get("LIVEKIT_AGENT_SECRET", "")

        if not self.backend_url:
            logger.info("BACKEND_URL not set - backend function calls will be disabled")

        if not self.agent_secret:
            logger.info("LIVEKIT_AGENT_SECRET not set - backend calls may fail authentication")

        # Create assistant instructions
        instructions = (
            "You are a helpful voice assistant for a web application. "
            "You can answer questions and demonstrate calling backend functions. "
            "Keep responses conversational and natural for spoken dialogue. "
            "When asked to test the backend or database, use the increment_counter tool. "
            "When asked to test the LLM, use the call_backend_llm tool."
        )

        # Initialize agent with instructions (LLM set in AgentSession)
        super().__init__(
            instructions=instructions,
        )

    @llm.function_tool()
    async def increment_counter(self) -> str:
        """
        Increment the database counter to demonstrate backend and database integration.
        This shows the voice agent can call edge functions that interact with the database.
        Returns the new counter value.
        """
        if not self.backend_url or not self.agent_secret:
            return "Backend function calls are not configured. Please set BACKEND_URL and LIVEKIT_AGENT_SECRET."

        logger.info("🔧 Tool call: increment_counter()")

        try:
            url = f"{self.backend_url}/increment-counter"
            headers = {
                "Content-Type": "application/json",
                "X-Agent-Secret": self.agent_secret,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={}, headers=headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()

                logger.info(f"✅ Tool response: {data}")

                if "count" in data:
                    return f"The counter is now at {data['count']}."
                else:
                    return f"Counter updated: {data}"

        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling backend: {e}")
            return f"Error calling counter function: {str(e)}"
        except Exception as e:
            logger.error(f"Error calling backend: {e}")
            return f"Error: {str(e)}"

    @llm.function_tool()
    async def call_backend_llm(
        self,
        prompt: Annotated[str, "The prompt to send to the backend LLM"],
    ) -> str:
        """
        Call the test-llm edge function to demonstrate calling an LLM from the agent.
        This shows how the voice agent can delegate to other LLMs for specialized tasks.
        """
        if not self.backend_url or not self.agent_secret:
            return "Backend function calls are not configured. Please set BACKEND_URL and LIVEKIT_AGENT_SECRET."

        logger.info(f"🔧 Tool call: call_backend_llm(prompt='{prompt}')")

        try:
            url = f"{self.backend_url}/test-llm"
            headers = {
                "Content-Type": "application/json",
                "X-Agent-Secret": self.agent_secret,
            }
            payload = {
                "prompt": prompt,
                "user_email": "agent@voice",
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()

                logger.info(f"✅ Tool response: {data}")

                if "response" in data:
                    return f"Backend LLM responded: {data['response']}"
                else:
                    return f"Backend responded: {data}"

        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling backend: {e}")
            return f"Error calling backend function: {str(e)}"
        except Exception as e:
            logger.error(f"Error calling backend: {e}")
            return f"Error: {str(e)}"

    async def on_enter(self):
        """Called when agent enters the session"""
        logger.info("Voice assistant entered session")

    async def on_exit(self):
        """Called when agent exits the session"""
        logger.info("Voice assistant exiting session")


async def entrypoint(ctx: JobContext):
    """Main entry point for the voice agent"""
    # Logging setup
    logger.info(f"Starting voice agent v{VERSION} for room {ctx.room.name}")

    # Create the assistant
    assistant = VoiceAssistant()

    # Create agent session with LiveKit Inference for STT, LLM, and TTS
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",  # Using LiveKit Inference (recommended)
        llm="openai/gpt-4.1-mini",  # Using LiveKit Inference
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",  # Using LiveKit Inference with explicit voice
        vad=ctx.proc.userdata["vad"],  # Use prewarmed VAD
        turn_detection=MultilingualModel(),  # Contextual turn detection
        preemptive_generation=True,  # Generate responses while user is still speaking
    )

    # Add event listeners for monitoring
    @session.on("user_speech_committed")
    def on_user_speech(ev):
        logger.info(f"🎤 User said: {ev.alternatives[0].text if ev.alternatives else 'N/A'}")

    @session.on("agent_speech_committed")
    def on_agent_speech(ev):
        logger.info(f"🔊 Agent said: {ev.alternatives[0].text if ev.alternatives else 'N/A'}")

    @session.on("agent_started_speaking")
    def on_agent_started_speaking(ev):
        logger.info("🔊 Agent started speaking")

    @session.on("agent_stopped_speaking")
    def on_agent_stopped_speaking(ev):
        logger.info("🔇 Agent stopped speaking")

    @session.on("user_started_speaking")
    def on_user_started_speaking(ev):
        logger.info("🎤 User started speaking")

    @session.on("user_stopped_speaking")
    def on_user_stopped_speaking(ev):
        logger.info("🎤 User stopped speaking")

    # Add track subscription monitoring
    @session.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        logger.info(f"📥 Subscribed to {track.kind} track from {participant.identity}")

    @ctx.room.on("track_published")
    def on_track_published(publication, participant):
        logger.info(f"📢 Track published: {publication.kind} by {participant.identity}")

    # Start the session
    await session.start(
        agent=assistant,
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
            audio_enabled=True,
            pre_connect_audio=True,
            pre_connect_audio_timeout=3.0,
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()

    # Wait for everything to be fully ready
    await asyncio.sleep(1.0)

    # Greet user
    logger.info("Generating greeting...")
    session.generate_reply(
        instructions="Give a brief, friendly greeting. Tell the user you can help answer questions and demonstrate calling backend functions. Keep it under 2 sentences."
    )

    # Add shutdown callback
    async def cleanup():
        logger.info("Session ending, cleaning up...")

    ctx.add_shutdown_callback(cleanup)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
