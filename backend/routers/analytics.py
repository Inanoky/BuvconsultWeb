from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import Attendance, Worker, Invoice, Work, Location
from datetime import datetime
import pandas as pd

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

#This is a test comment

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    result = db.query(
        Attendance.worker_id,
        Attendance.timestamp,
        Attendance.action,
        Attendance.work_id,
        Attendance.location_id,
        Attendance.worker_profession,
        Worker.salary
    ).join(Worker, Attendance.worker_id == Worker.id).order_by(Attendance.worker_id, Attendance.timestamp).all()

    rows = [dict(
        worker_id=r.worker_id,
        timestamp=r.timestamp,
        action=r.action,
        work_id=r.work_id,
        location_id=r.location_id,
        worker_profession=r.worker_profession,
        salary=r.salary
    ) for r in result]

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Clock-in/out pairing
    pairs = []
    for worker_id, group in df.groupby("worker_id"):
        clock_in = None
        for _, row in group.iterrows():
            if row["action"] == "Clock In":
                clock_in = row
            elif row["action"] == "Clock Out" and clock_in is not None:
                hours = (row["timestamp"] - clock_in["timestamp"]).total_seconds() / 3600
                cost = hours * row["salary"]
                pairs.append({
                    "week": clock_in["timestamp"].strftime("%Y-W%U"),
                    "month": clock_in["timestamp"].strftime("%Y-%m"),
                    "location_id": row["location_id"],
                    "work_id": row["work_id"],
                    "hours": hours,
                    "cost": cost
                })
                clock_in = None

    paired_df = pd.DataFrame(pairs)

    # Map work/location names
    work_map = {w.id: w.task for w in db.query(Work).all()}
    loc_map = {l.id: l.name for l in db.query(Location).all()}
    paired_df["work_type"] = paired_df["work_id"].map(work_map)
    paired_df["location_name"] = paired_df["location_id"].map(loc_map)

    # Group salaries by time periods
    weekly_salaries = paired_df.groupby(["week"]).agg({"cost": "sum"}).reset_index()
    weekly_salaries["category"] = "Salaries"

    monthly_salaries = paired_df.groupby(["month"]).agg({"cost": "sum"}).reset_index()
    monthly_salaries["category"] = "Salaries"

    # Group invoices by category and time
    inv_df = pd.read_sql("SELECT invoice_date, sum as price, category FROM invoices", db.bind)
    inv_df["invoice_date"] = pd.to_datetime(inv_df["invoice_date"], format="%d.%m.%Y", errors="coerce")
    inv_df.dropna(subset=["invoice_date"], inplace=True)
    inv_df["week"] = inv_df["invoice_date"].dt.strftime("%Y-W%U")
    inv_df["month"] = inv_df["invoice_date"].dt.strftime("%Y-%m")

    weekly_inv = inv_df.groupby(["week", "category"])["price"].sum().reset_index()
    monthly_inv = inv_df.groupby(["month", "category"])["price"].sum().reset_index()

    # Combine invoices and salaries
    full_weekly = pd.concat([
        weekly_inv.rename(columns={"price": "spending"}),
        weekly_salaries.rename(columns={"cost": "spending", "week": "week"})
    ])

    full_monthly = pd.concat([
        monthly_inv.rename(columns={"price": "spending"}),
        monthly_salaries.rename(columns={"cost": "spending", "month": "month"})
    ])

    # Pivot for stacked format
    weekly_stack = full_weekly.pivot_table(index="week", columns="category", values="spending",
                                           fill_value=0).reset_index()
    weekly_stack["month"] = pd.to_datetime(weekly_stack["week"] + '-1', format='%Y-W%W-%w').dt.strftime('%Y-%m')


    monthly_stack = full_monthly.pivot_table(index="month", columns="category", values="spending", fill_value=0).reset_index()

    # Remaining analytics
    by_cat = inv_df.groupby("category")["price"].sum().reset_index()
    by_cat = pd.concat([by_cat, pd.DataFrame([{"category": "Salaries", "price": paired_df["cost"].sum()}])])

    work_type = paired_df.groupby("work_type")[["hours", "cost"]].sum().reset_index()
    location = paired_df.groupby("location_name")[["hours", "cost"]].sum().reset_index()

    print("DEBUG WEEKLY STACK:")
    print(weekly_stack.head())
    print("MONTHS:", weekly_stack["month"].unique())


    return {
        "weekly_spending": weekly_stack.to_dict("records"),
        "monthly_spending": monthly_stack.to_dict("records"),
        "by_category": by_cat.to_dict("records"),
        "by_work_type": work_type.to_dict("records"),
        "by_location": location.to_dict("records")
    }


@router.get("/by-unit")
def get_cost_by_unit(db: Session = Depends(get_db)):
    result = db.query(
        Attendance.worker_id,
        Attendance.timestamp,
        Attendance.action,
        Attendance.work_id,
        Attendance.location_id,
        Attendance.worker_profession,
        Worker.salary
    ).join(Worker, Attendance.worker_id == Worker.id).order_by(Attendance.worker_id, Attendance.timestamp).all()

    rows = [dict(
        worker_id=r.worker_id,
        timestamp=r.timestamp,
        action=r.action,
        work_id=r.work_id,
        location_id=r.location_id,
        worker_profession=r.worker_profession,
        salary=r.salary
    ) for r in result]

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    pairs = []
    for worker_id, group in df.groupby("worker_id"):
        clock_in = None
        for _, row in group.iterrows():
            if row["action"] == "Clock In":
                clock_in = row
            elif row["action"] == "Clock Out" and clock_in is not None:
                hours = (row["timestamp"] - clock_in["timestamp"]).total_seconds() / 3600
                cost = hours * row["salary"]
                pairs.append({
                    "location_id": row["location_id"],
                    "work_id": row["work_id"],
                    "hours": hours,
                    "cost": cost
                })
                clock_in = None

    paired_df = pd.DataFrame(pairs)

    work_map = {w.id: w.task for w in db.query(Work).all()}
    loc_map = {l.id: l.name for l in db.query(Location).all()}
    paired_df["work_type"] = paired_df["work_id"].map(work_map)
    paired_df["location_name"] = paired_df["location_id"].map(loc_map)

    grouped = paired_df.groupby(["location_name", "work_type"])["cost"].sum().reset_index()
    return grouped.to_dict("records")

@router.get("/totals")
def get_totals_summary(db: Session = Depends(get_db)):
    result = db.query(
        Attendance.worker_id,
        Attendance.timestamp,
        Attendance.action,
        Attendance.work_id,
        Attendance.location_id,
        Attendance.worker_profession,
        Worker.salary
    ).join(Worker, Attendance.worker_id == Worker.id).order_by(Attendance.worker_id, Attendance.timestamp).all()

    rows = [dict(
        worker_id=r.worker_id,
        timestamp=r.timestamp,
        action=r.action,
        work_id=r.work_id,
        location_id=r.location_id,
        worker_profession=r.worker_profession,
        salary=r.salary
    ) for r in result]

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    pairs = []
    for worker_id, group in df.groupby("worker_id"):
        clock_in = None
        for _, row in group.iterrows():
            if row["action"] == "Clock In":
                clock_in = row
            elif row["action"] == "Clock Out" and clock_in is not None:
                hours = (row["timestamp"] - clock_in["timestamp"]).total_seconds() / 3600
                cost = hours * row["salary"]
                pairs.append({
                    "location_id": row["location_id"],
                    "work_id": row["work_id"],
                    "hours": hours,
                    "cost": cost
                })
                clock_in = None

    paired_df = pd.DataFrame(pairs)
    if paired_df.empty:
        return {}

    # Load location + work unit data
    work_df = pd.read_sql("SELECT id, task, units, amounts, location_id FROM works", db.bind)
    loc_df = pd.read_sql("SELECT id, name, amounts FROM locations", db.bind)
    inv_df = pd.read_sql("SELECT sum as price, category FROM invoices", db.bind)

    # Map names and units
    work_map = dict(zip(work_df.id, work_df.task))
    unit_map = dict(zip(work_df.id, work_df.units))
    amount_map = dict(zip(work_df.id, work_df.amounts))
    paired_df["work_type"] = paired_df["work_id"].map(work_map)

    loc_m2_total = loc_df["amounts"].sum()
    concrete_volume = work_df[work_df.task == "Concreting"]["amounts"].sum()
    salary_cost = paired_df["cost"].sum()
    invoice_total = inv_df["price"].sum()
    concrete_invoice_cost = inv_df[inv_df["category"] == "Concrete"]["price"].sum()
    project_total_cost = salary_cost + invoice_total
    cat_group = inv_df.groupby("category")["price"].sum().reset_index()


    def format_num(n):
        return f"{n:,.2f}" if isinstance(n, (int, float)) else n

    work_type_summary = []
    for task in paired_df["work_type"].unique():
        task_df = paired_df[paired_df["work_type"] == task]
        task_salary_cost = task_df["cost"].sum()
        wids = work_df[work_df.task == task]["id"].tolist()
        task_units = unit_map[wids[0]] if wids else ""
        task_total_amount = work_df[work_df.task == task]["amounts"].sum()
        if task_total_amount > 0:
            work_type_summary.append({
                "work_type": task,
                "salary_cost": format_num(task_salary_cost),
                "unit": task_units,
                "amount": format_num(task_total_amount),
                "cost_per_unit": format_num(task_salary_cost / task_total_amount)
            })

    # Optional: try to extract units from tasks if available
    cat_summary = []
    for _, row in cat_group.iterrows():
        cat = row["category"]
        price = row["price"]
        # Try to get total quantity from work_df
        if cat == "Concrete":
            amount = concrete_volume
            unit = "m³"
        elif cat == "Salaries":
            amount = loc_m2_total
            unit = "m²"
        else:
            amount = None
            unit = ""
        formatted = {
            "category": cat,
            "total_cost": format_num(price),
            "amount": format_num(amount) if amount else "",
            "unit": unit,
            "cost_per_unit": format_num(price / amount) + f" EUR/{unit}" if amount else ""
        }
        cat_summary.append(formatted)
    print(cat_summary)




    return {
        "total_cost": format_num(project_total_cost),
        "salary_cost": format_num(salary_cost),
        "concrete_cost": format_num(concrete_invoice_cost),
        "total_m2": format_num(loc_m2_total),
        "total_m3_concrete": format_num(concrete_volume),
        "cost_per_m2": format_num(project_total_cost / loc_m2_total),
        "cost_per_m3": format_num(concrete_invoice_cost / concrete_volume),
        "salary_per_m2": format_num(salary_cost / loc_m2_total),
        "salary_per_m3": format_num(salary_cost / concrete_volume),
        "work_type_salaries": work_type_summary,
        "category_summary": cat_summary
    }
