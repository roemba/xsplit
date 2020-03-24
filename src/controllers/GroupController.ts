import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Post, Body, Put, Param, UnauthorizedError} from "routing-controllers";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import { BillService } from "../services/BillService";
import { LoggerService } from "../services/LoggerService";
import { Group } from "../models/Group";
import { GroupService } from "../services/GroupService";

@JsonController("/api/groups")
export class GroupController {

    log = Container.get(LoggerService);

    @Authorized()
    @Get("/")
    getMyGroups(@CurrentUser() user: User): Promise<Bill[]> {
        return Container.get(BillService).findUserBills(user);
    }

    @Authorized()
    @Post("/")
    createGroup(@CurrentUser() user: User, @Body() body: Group): Promise<Group> {
        const group = new Group();
        group.description = body.description;
        group.name = body.name;
        group.participants = [];
        body.participants.forEach((user: User) => {
            const part = new User();
            part.username = user.username;
            group.participants.push(part);
        });
        return Container.get(GroupService).create(group);
    }

    @Authorized()
    @Put("/:id")
    put(@CurrentUser() user: User, @Param("id") id: string, @Body() body: Group): Promise<Group> {
        // Check if person trying to edit is member of group
        const index = body.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }

       return Container.get(GroupService).update(id, body);
    }

    @Authorized()
    @Put("/:id/bill")
    async addBill(@CurrentUser() user: User, @Param("id") id: string, @Body() bill: Bill): Promise<Group> {
        // Check if person trying to edit is member of group
        const group = await Container.get(GroupService).findOne(id);
        const index = group.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }

       return Container.get(GroupService).addBill(user, id, bill);
    }

    @Authorized()
    @Put("/:id/:userid")
    async addParticipant(@CurrentUser() user: User, @Param("id") id: string, @Param("userid") userId: string): Promise<Group> {
        const groupService = Container.get(GroupService);
        const group = await groupService.findOne(id);
        
        // Check if person trying to edit is member of group
        const index = group.participants.findIndex(participant => participant.username === user.username);
        if (index === -1) {
            throw new UnauthorizedError("You are not a participant of this group");
        }
        return Container.get(GroupService).addParticipant(id, userId);
    }
}