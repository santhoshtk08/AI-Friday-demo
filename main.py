import os
import operator
from typing import Annotated, List, TypedDict, Literal

from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver


# 1. Define the Shared State
class AgentState(TypedDict):
    input: str
    agent_outputs: Annotated[List[str], operator.add]
    evaluation_score: int
    final_output: str


# 2. Initialize Groq LLM
llm = ChatGroq(
    temperature=0,
    model_name="llama-3.3-70b-versatile",
    groq_api_key=""# ✅ safer (set env variable)
)


# --- Nodes ---
def distributor(state: AgentState):
    return {"agent_outputs": []}


def worker_tech(state: AgentState):
    res = llm.invoke(f"Provide a technical analysis of: {state['input']}")
    return {"agent_outputs": [f"TECH: {res.content}"]}


def worker_market(state: AgentState):
    res = llm.invoke(f"Provide a market impact analysis of: {state['input']}")
    return {"agent_outputs": [f"MARKET: {res.content}"]}


def worker_risk(state: AgentState):
    res = llm.invoke(f"Provide a risk assessment of: {state['input']}")
    return {"agent_outputs": [f"RISK: {res.content}"]}


def evaluator(state: AgentState):
    combined = "\n".join(state["agent_outputs"])
    res = llm.invoke(
        f"On a scale of 1-10, how complete is this report? Return ONLY the number:\n{combined}"
    )
    try:
        score = int(res.content.strip())
    except:
        score = 8
    return {"evaluation_score": score}


def refiner(state: AgentState):
    combined = "\n".join(state["agent_outputs"])
    res = llm.invoke(
        f"Summarize and refine these 3 perspectives into a professional executive report:\n{combined}"
    )
    return {"final_output": res.content}


# 3. Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("distributor", distributor)
workflow.add_node("worker_tech", worker_tech)
workflow.add_node("worker_market", worker_market)
workflow.add_node("worker_risk", worker_risk)
workflow.add_node("evaluator", evaluator)
workflow.add_node("refiner", refiner)

workflow.add_edge(START, "distributor")
workflow.add_edge("distributor", "worker_tech")
workflow.add_edge("distributor", "worker_market")
workflow.add_edge("distributor", "worker_risk")

workflow.add_edge("worker_tech", "evaluator")
workflow.add_edge("worker_market", "evaluator")
workflow.add_edge("worker_risk", "evaluator")


def route_after_evaluation(state: AgentState) -> Literal["refiner", END]:
    return "refiner" if state["evaluation_score"] >= 7 else END


workflow.add_conditional_edges("evaluator", route_after_evaluation)
workflow.add_edge("refiner", END)

# 4. Compile with Memory
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


# 5. CMD Chatbot Loop
if __name__ == "__main__":
    print("\n🤖 Multi-Agent CMD Chatbot Started!")
    print("Type 'exit' or 'quit' to stop.\n")

    thread_id = "1"
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": 20}

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("\nBot: Bye bro 👋")
            break

        inputs = {"input": user_input}
        result = app.invoke(inputs, config)

        final_output = result.get("final_output", None)

        if final_output:
            print("\nBot:\n")
            print(final_output)
            print("\n" + "=" * 60 + "\n")
        else:
            print("\nBot: Report not generated (Evaluation score low). Try rephrasing.\n")
