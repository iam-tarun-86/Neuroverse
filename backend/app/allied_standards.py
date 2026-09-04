import json
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import networkx as nx

from app.config import DATASET_PATH

logger = logging.getLogger("standardiq.allied_standards")

# Human-readable labels and ordering for reference types
REFERENCE_TYPE_LABELS: Dict[str, str] = {
    "material_standard": "Material Specifications",
    "test_method": "Test Methods",
    "safety_standard": "Safety & Protection",
    "installation_standard": "Installation Guidelines",
    "terminology_standard": "Terminology & Vocabulary",
}

# External standards metadata for references cited in dataset but not in top 49 corpus
EXTERNAL_STANDARDS_METADATA: Dict[str, Dict[str, str]] = {
    "IS 10810 (Part 10): 1984": {
        "title": "Methods of Test for Cables — Part 10: Loss of Mass Test",
        "status": "Active",
        "sector": "Electrical",
        "certification": "Voluntary",
    },
    "IS 10810 (Part 37): 1984": {
        "title": "Methods of Test for Cables — Part 37: Tensile Strength and Elongation of Armour Wire/Strip",
        "status": "Active",
        "sector": "Electrical",
        "certification": "Voluntary",
    },
    "IS 10810 (Part 63): 1993": {
        "title": "Methods of Test for Cables — Part 63: Smoke Density Test",
        "status": "Active",
        "sector": "Electrical",
        "certification": "Voluntary",
    },
}

class AlliedStandardsGraph:
    """
    In-memory directed graph of Bureau of Indian Standards (BIS)
    normative and allied cross-references built using NetworkX.
    100% local, zero cloud egress.
    """

    def __init__(self, dataset_path: Path = DATASET_PATH):
        self.dataset_path = dataset_path
        self.graph = nx.DiGraph()
        self._standards_with_references_count = 0
        self._total_dataset_standards = 0
        self._build_graph()

    def _build_graph(self) -> None:
        if not self.dataset_path.exists():
            logger.error(f"Dataset path does not exist: {self.dataset_path}")
            return

        with open(self.dataset_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self._total_dataset_standards = len(data)

        # 1. Add all primary standards as nodes
        for item in data:
            std_id = item["standard_id"]
            self.graph.add_node(
                std_id,
                title=item.get("title", ""),
                status=item.get("status", "Active"),
                sector=item.get("sector", "Electrical"),
                certification=item.get("certification", "None"),
                scope_text=item.get("scope_text", ""),
            )

        # 2. Add directed edges and any external referenced nodes
        for item in data:
            std_id = item["standard_id"]
            normative_refs = item.get("normative_references", [])
            ref_types = item.get("reference_type", {})

            if normative_refs:
                self._standards_with_references_count += 1

            for ref_id in normative_refs:
                if ref_id not in self.graph:
                    # Provide fallback metadata if external standard
                    ext_meta = EXTERNAL_STANDARDS_METADATA.get(
                        ref_id,
                        {
                            "title": f"Indian Standard Reference ({ref_id})",
                            "status": "Active",
                            "sector": "Electrical",
                            "certification": "Voluntary",
                        },
                    )
                    self.graph.add_node(
                        ref_id,
                        title=ext_meta.get("title", f"Indian Standard Reference ({ref_id})"),
                        status=ext_meta.get("status", "Active"),
                        sector=ext_meta.get("sector", "Electrical"),
                        certification=ext_meta.get("certification", "Voluntary"),
                        scope_text="",
                    )

                ref_type = ref_types.get(ref_id, "normative_reference")
                self.graph.add_edge(std_id, ref_id, reference_type=ref_type)

        logger.info(
            f"Allied standards graph built: {self.graph.number_of_nodes()} nodes, "
            f"{self.graph.number_of_edges()} edges across {self._standards_with_references_count}/{self._total_dataset_standards} standards."
        )

    def get_allied_standards(self, standard_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Returns 1-hop outgoing neighbors from the graph for the given standard_id,
        grouped by reference_type.
        """
        if standard_id not in self.graph:
            return {}

        neighbors = list(self.graph.successors(standard_id))
        if not neighbors:
            return {}

        grouped: Dict[str, List[Dict[str, Any]]] = {}

        # Preferred group ordering
        type_order = [
            "material_standard",
            "test_method",
            "safety_standard",
            "installation_standard",
            "terminology_standard",
        ]

        for neighbor_id in neighbors:
            edge_data = self.graph.get_edge_data(standard_id, neighbor_id, default={})
            ref_type = edge_data.get("reference_type", "normative_reference")
            node_data = self.graph.nodes[neighbor_id]

            item = {
                "standard_id": neighbor_id,
                "title": node_data.get("title", ""),
                "status": node_data.get("status", "Active"),
                "reference_type": ref_type,
                "reference_type_label": REFERENCE_TYPE_LABELS.get(
                    ref_type, ref_type.replace("_", " ").title()
                ),
                "certification": node_data.get("certification", "None"),
            }

            if ref_type not in grouped:
                grouped[ref_type] = []
            grouped[ref_type].append(item)

        # Sort keys based on preferred ordering
        sorted_grouped = {}
        for t in type_order:
            if t in grouped:
                sorted_grouped[t] = grouped[t]
        for t, items in grouped.items():
            if t not in sorted_grouped:
                sorted_grouped[t] = items

        return sorted_grouped

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "standards_with_references": self._standards_with_references_count,
            "total_dataset_standards": self._total_dataset_standards,
        }


# Singleton graph instance
_allied_graph_instance: Optional[AlliedStandardsGraph] = None


def get_allied_graph() -> AlliedStandardsGraph:
    global _allied_graph_instance
    if _allied_graph_instance is None:
        _allied_graph_instance = AlliedStandardsGraph()
    return _allied_graph_instance


def get_allied_standards(standard_id: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Convenience function returning 1-hop allied standards grouped by type.
    """
    return get_allied_graph().get_allied_standards(standard_id)
