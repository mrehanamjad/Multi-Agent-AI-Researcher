from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain
from rich import print

def run_research_pipeline(topic: str) -> dict:
    
    state = {}

    # search agent working
    print("\n"+"="*50)
    print("Step 1: Search Agent is working...")
    print("="*50)

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [{
                "role": "user", 
                "content": f"Find recent, reliable and detailed information about: {topic}"
            }]
        })
    
    print(f"\nRaw Search Agent Output:\n{search_result}\n\n")

    # print(search_result) 
    # as it is build with craete_agent method output will be like this:
    # {
    #     "messages": [
    #         HumanMessage(content="..."),
    #         AIMessage(content="...",tool_calls=[{"name": "web_search", ...}])
    #         ToolMessage(content="...",... )
    #         AIMessage(content="...",)
    #     ]
    # }
    # so we extract the last AIMessage content 

    state['search_result'] = search_result['messages'][-1].content

    print(f"\nSearch Result:\n{state['search_result']}")

    # Step 2: Reader Agent working
    print("\n"+"="*50)
    print("Step 2: Reader Agent is working...")
    print("="*50)

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [{
                "role": "user", 
                "content": f"Based on the following search results, pic the most relevant URL and scrape its content for deeper insights.\n\nSearch Results:\n{state['search_result']}"
            }]
        })
    state['reader_result'] = reader_result['messages'][-1].content

    print(f"\nReader Result:\n{state['reader_result']}")

    # Step 3: Writer Chain working
    print("\n"+"="*50)
    print("Step 3: Writer  is drafting a report...")
    print("="*50)

    search_conbined = (
        f"SEARCH RESULTS: \n {state['search_result']} \n\n"
        f"DETAILED SCRAPED CONTENT: \n {state['reader_result']}"
    ) 

    state["report"] = writer_chain.invoke({
        "topic": topic,
        "research": search_conbined
    })

    print(f"\nGenerated Final Report:\n{state['report']}")

    # Step 4: Critic Chain working
    print("\n"+"="*50)
    print("Step 4: Critic is evaluating the report...")
    print("="*50)

    state["feedback"] = critic_chain.invoke({
        "report": state["report"]
    })

    print(f"\nCritic Feedback:\n{state['feedback']}")

    return state

if __name__ == "__main__":
    topic = input("Enter a research topic: ")
    run_research_pipeline(topic)  
