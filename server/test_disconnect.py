import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(timeout=10) as client:
        # Start a request but cancel it
        print("Starting request...")
        try:
            # We don't have a valid auth token easily accessible here unless auth bypass is on.
            # I will just write it and run it. If auth fails we see 401.
            req = client.build_request(
                "POST", 
                "http://localhost:8002/research",
                json={"topic": "Quantum Computing"},
                headers={"Authorization": "Bearer DEV_TOKEN"} # Requires bypass or manual test
            )
            resp = await client.send(req, stream=True)
            if resp.status_code != 200:
                print(f"Failed: {resp.status_code}")
                return
            
            async for line in resp.aiter_lines():
                if line.startswith("data:"):
                    print("Got event:", line)
                    print("Disconnecting early!")
                    break
        except Exception as e:
            print("Client closed with error:", e)

if __name__ == "__main__":
    asyncio.run(main())
