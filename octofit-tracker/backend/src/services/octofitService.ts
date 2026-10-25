import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const body = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const userId = String(body.userId ?? '').trim();
  const teamId = String(body.teamId ?? '').trim();
  const type = String(body.type ?? '').trim();
  const minutesValue = Number(body.minutes);

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw badRequest('Valid userId and teamId are required.');
  }

  if (!type) {
    throw badRequest('Activity type is required.');
  }

  if (!Number.isFinite(minutesValue) || minutesValue <= 0) {
    throw badRequest('Activity minutes must be a positive number.');
  }

  const userExists = await User.exists({ _id: userId });
  const teamExists = await Team.exists({ _id: teamId });

  if (!userExists || !teamExists) {
    throw badRequest('Activity must reference an existing user and team.');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes: minutesValue,
    points: minutesValue,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  const body = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const name = String(body.name ?? '').trim();
  const mascot = String(body.mascot ?? '').trim();
  const rawMembers = Array.isArray(body.members) ? body.members : [];

  if (!name) {
    throw badRequest('Team name is required.');
  }

  if (!mascot) {
    throw badRequest('Team mascot is required.');
  }

  const members = rawMembers.map((member) => String(member)).filter(Boolean);
  for (const member of members) {
    if (!mongoose.Types.ObjectId.isValid(member)) {
      throw badRequest('Each team member must be a valid ObjectId.');
    }
  }

  const team = await Team.create({
    name,
    mascot,
    members,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamDoc',
      },
    },
    {
      $project: {
        _id: 0,
        teamId: '$_id',
        totalPoints: 1,
        teamName: { $ifNull: [{ $arrayElemAt: ['$teamDoc.name', 0] }, 'Unknown team'] },
      },
    },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail?.trim().toLowerCase();
  if (!email) {
    throw badRequest('User email is required.');
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found.'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentFocuses = recentActivities.map((activity) => String(activity.type ?? '').trim()).filter(Boolean);
  const preferredFocuses = [user.fitnessGoal, ...recentFocuses].filter(Boolean).map((focus) => String(focus).trim().toLowerCase());

  let workouts = await Workout.find({ focus: { $in: preferredFocuses } }).sort({ minutes: 1 }).lean();
  if (workouts.length === 0) {
    workouts = await Workout.find().sort({ minutes: 1 }).lean();
  }

  if (workouts.length === 0) {
    return [];
  }

  const first = workouts[0];
  const recentType = recentActivities[0]?.type ? String(recentActivities[0].type) : 'activity';
  const goalText = user.fitnessGoal ? String(user.fitnessGoal) : 'your recent activity';

  return workouts.map((workout, index) => ({
    ...workout,
    reason: index === 0 ? `Matches your recent ${recentType} activity and ${goalText} goal.` : `Related to your ${first.focus ?? 'activity'} focus.`,
  }));
}

export { User };
