from fastapi import APIRouter, Query
from app.services.population_service import population_service
from app.schemas.population import PopulationExposure

router = APIRouter(prefix="/population", tags=["Population"])

@router.get("", response_model=PopulationExposure)
def get_population_exposure(cyclone_id: str = Query("cyclone_dana")):
    """Returns demographic exposure aggregation across Critical, High, and Moderate impact corridors."""
    return population_service.calculate_exposure(cyclone_id)
