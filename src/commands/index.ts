import Command from './Command';
import AddUserCommand from './AddUserCommand';
import CreateRRCommand from './CreateRRCommand';
import GetCommand from './GetCommand';
import GetRewardsCommand from './GetRewardsCommand';
import PingCommand from './PingCommand';
import RankupCommand from './RankupCommand';
import RegisterCommand from './RegisterCommand';
import RemoveRRCommand from './RemoveRRCommand';
import RemoveUserCommand from './RemoveUserCommand';
import UnregisterCommand from './UnregisterCommand';

class Commands {
    static commands: Command[] = [
        new AddUserCommand(),
        new CreateRRCommand(),
        new GetCommand(),
        new GetRewardsCommand(),
        new PingCommand(),
        new RankupCommand(),
        new RegisterCommand(),
        new RemoveRRCommand(),
        new RemoveUserCommand(),
        new UnregisterCommand(),
    ];
}

export default Commands.commands;
