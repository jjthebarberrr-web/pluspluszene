from fastapi import APIRouter, Query
from app.database import get_pool

router = APIRouter(prefix="/api/rare-items", tags=["rare-items"])


@router.get("")
async def get_rare_items(category: str = "all", search: str = ""):
    """Get rare/valuable items from the catalog with their values."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Query catalog items that are considered rare/valuable
            # Items with cost_credits > 0 from specific page IDs (rares sections)
            # or items marked as limited edition
            query = """
                SELECT ci.id, ci.catalog_name, ci.cost_credits, ci.cost_points,
                       ci.points_type, ci.limited_sells, ci.limited_stack,
                       ci.page_id, cp.caption as page_caption,
                       i.item_name, i.sprite_id
                FROM catalog_items ci
                LEFT JOIN catalog_pages cp ON ci.page_id = cp.id
                LEFT JOIN items_base i ON ci.item_ids = CAST(i.id AS CHAR)
                WHERE ci.cost_credits > 0
            """
            params = []

            if category == "limiteds":
                query += " AND ci.limited_stack > 0"
            elif category == "super-rares":
                query += " AND ci.cost_credits >= 100"
            elif category == "rares":
                query += " AND ci.cost_credits >= 25 AND ci.cost_credits < 100"
            elif category == "furni":
                query += " AND ci.cost_credits < 25 AND ci.cost_credits > 0"

            if search:
                query += " AND (ci.catalog_name LIKE %s OR COALESCE(i.item_name, '') LIKE %s)"
                params.extend([f"%{search}%", f"%{search}%"])

            query += " ORDER BY ci.cost_credits DESC LIMIT 100"

            await cur.execute(query, params if params else None)
            rows = await cur.fetchall()

            items = []
            for r in rows:
                item_id = r[0]
                name = r[1] or "Unknown Item"
                cost = r[2]
                limited_sells = r[5] or 0
                limited_stack = r[6] or 0
                sprite_id = r[10] or 0

                # Determine rarity level
                if limited_stack > 0:
                    rarity = "Limited"
                elif cost >= 100:
                    rarity = "Super Rare"
                elif cost >= 25:
                    rarity = "Rare"
                else:
                    rarity = "Common"

                # Determine category
                if limited_stack > 0:
                    cat = "limiteds"
                elif cost >= 100:
                    cat = "super-rares"
                elif cost >= 25:
                    cat = "rares"
                else:
                    cat = "furni"

                # Determine trend (based on limited availability)
                if limited_stack > 0 and limited_sells > 0:
                    remaining_pct = (limited_stack - limited_sells) / limited_stack
                    if remaining_pct < 0.2:
                        trend = "up"
                    elif remaining_pct > 0.8:
                        trend = "down"
                    else:
                        trend = "stable"
                elif cost >= 50:
                    trend = "up"
                else:
                    trend = "stable"

                # Clean up the name for display
                display_name = name.replace("_", " ").title()

                items.append({
                    "id": item_id,
                    "name": display_name,
                    "image_url": f"/habbo-assets/c_images/catalogue/icon_{sprite_id}.png" if sprite_id else "",
                    "value_credits": cost,
                    "trend": trend,
                    "category": cat,
                    "rarity": rarity,
                    "limited_sells": limited_sells,
                    "limited_stack": limited_stack,
                })

    return {"items": items}
