import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Post, Body, Put, Param, UnauthorizedError, BadRequestError} from "routing-controllers";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import { LoggerService } from "../services/LoggerService";
import { Group } from "../models/Group";
import { GroupService } from "../services/GroupService";
import { IsString, IsNotEmpty, MaxLength, ArrayNotEmpty } from "class-validator";
import { AddBillRequest } from "./BillController";
import { BillWeight } from "../models/BillWeight";

export class AddGroupRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    name: string;
    
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ArrayNotEmpty()
    @IsString({each: true})
    @MaxLength(1000, {each: true})
    participants: string[];
}

export class UpdateGroupRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    name: string;
    
    @IsString()
    @MaxLength(1000)
    description: string;
}

@JsonController("/api/groups")
export class GroupController {

    log = Container.get(LoggerService);

    @Authorized()
    @Get("/")
    getMyGroups(@CurrentUser() user: User): Promise<Group[]> {
        return Container.get(GroupService).findUserGroups(user);
    }

    @Authorized()
    @Get("/:id")
    async getGroup(@CurrentUser() user: User, @Param("id") id: string): Promise<Group> {
        const group = await Container.get(GroupService).findOne(id);
        // Check if person trying to get is member of group
        const index = group.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }
        return group;
    }

    @Authorized()
    @Post("/")
    createGroup(@CurrentUser() user: User, @Body() body: AddGroupRequest): Promise<Group> {
        const group = new Group();
        group.description = body.description;
        group.name = body.name;
        group.participants = [];
        body.participants.forEach(username => {
            const part = new User();
            part.username = username;
            group.participants.push(part);
        });
        return Container.get(GroupService).create(group);
    }

    @Authorized()
    @Put("/:id")
    async update(@CurrentUser() user: User, @Param("id") id: string, @Body() body: UpdateGroupRequest): Promise<Group> {
        const group = await Container.get(GroupService).findOne(id);
        // Check if person trying to edit is member of group
        const index = group.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }

        const groupUpdate = new Group();
        groupUpdate.name = body.name;
        groupUpdate.description = body.description;

       return Container.get(GroupService).update(id, groupUpdate);
    }

    @Authorized()
    @Put("/:id/bill")
    async addBill(@CurrentUser() user: User, @Param("id") id: string, @Body() body: AddBillRequest): Promise<Group> {
        // Check if person trying to edit is member of group
        const group = await Container.get(GroupService).findOne(id);
        const index = group.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }

        const createdBill = new Bill();
        createdBill.creditor = user;
        createdBill.description = body.description;
        createdBill.totalXrpDrops = body.totalXrpDrops;
        createdBill.participants = [];
        createdBill.weights = [];

        if (body.participants.length !== body.weights.length) {
            throw new BadRequestError("Participant length and weight length must match!");
        }

        for (let i = 0; i < body.participants.length; i++) {
            const part = new User();
            part.username = body.participants[i];
            createdBill.participants.push(part);
            const weight = new BillWeight();
            weight.user = part;
            weight.bill = createdBill;
            weight.weight = body.weights[i];
            createdBill.weights.push(weight);
          }

       return Container.get(GroupService).addBill(id, createdBill);
    }

    @Authorized()
    @Put("/:id/user/:userid")
    async addParticipant(@CurrentUser() user: User, @Param("id") id: string, @Param("userid") userId: string): Promise<Group> {
        const groupService = Container.get(GroupService);
        const group = await groupService.findOne(id);
        
        // Check if person trying to edit is member of group and new user not already part of the group
        const index = group.participants.findIndex(participant => participant.username === user.username);
        const newUser = group.participants.findIndex(participant => participant.username === userId);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }
        if (newUser !== -1) {
            throw new BadRequestError("User you are trying to add is already part of this group");
        }
        return Container.get(GroupService).addParticipant(id, userId);
    }
}