# planning_management.py

class PlanningManager:
    def __init__(self):
        self.plans = {}

    def add_plan(self, streamer_name, plan):
        if streamer_name not in self.plans:
            self.plans[streamer_name] = []
        self.plans[streamer_name].append(plan)

    def get_plans(self, streamer_name):
        return self.plans.get(streamer_name, [])

    def remove_plan(self, streamer_name, plan_index):
        if streamer_name in self.plans and plan_index < len(self.plans[streamer_name]):
            del self.plans[streamer_name][plan_index]

    def clear_plans(self, streamer_name):
        if streamer_name in self.plans:
            self.plans[streamer_name] = []
