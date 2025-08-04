from mcp_agent import Agent, LocalServer, OpenAIChatModel

agent = Agent(
    model=OpenAIChatModel("gpt-4o"),  # Claude 사용 시 ClaudeChatModel
    servers=[
        LocalServer("filesystem", port=7900),        # 파일 시스템
        LocalServer("youtube-transcript", port=7901),        # YouTube transcript
    ]
)

video = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
prompt = f"""
1) youtube-transcript.get_transcript url="{video}" lang="ko"
2) transcript를 요약·키포인트·타임라인 표로 정리
3) filesystem.write_file path="report.md" content=(결과)
"""
print(agent.chat(prompt))