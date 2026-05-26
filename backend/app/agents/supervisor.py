from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.agents.stylist_agent import stylist_node
from app.agents.anti_return_agent import anti_return_node
from app.agents.negotiation_mediator import negotiation_mediator_node

class AgentState(TypedDict):
    session_id: str
    user_id: Optional[str]
    user_location: Optional[dict]
    user_photo_url: Optional[str]
    
    # Input
    raw_query: str
    extracted_entities: dict
    
    # Negotiation State
    negotiation_round: int
    negotiation_history: List[dict]
    negotiation_complete: bool
    
    # Current Round Data
    stylist_proposal: Optional[dict]
    anti_return_verdict: Optional[dict]
    
    # Final Output
    final_response: Optional[str]
    filtered_products: List[dict]
    agent_log: List[dict]


def create_negotiation_graph():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("stylist", stylist_node)
    workflow.add_node("anti_return", anti_return_node)
    workflow.add_node("mediator", negotiation_mediator_node)

    # Define Edges
    workflow.set_entry_point("stylist")
    workflow.add_edge("stylist", "anti_return")
    workflow.add_edge("anti_return", "mediator")

    # Conditional logic from mediator
    def mediator_router(state: AgentState) -> str:
        if state.get("negotiation_complete"):
            return "end"
        return "stylist"

    workflow.add_conditional_edges(
        "mediator",
        mediator_router,
        {
            "end": END,
            "stylist": "stylist"
        }
    )

    return workflow.compile()

# Singleton instance
negotiation_graph = create_negotiation_graph()
